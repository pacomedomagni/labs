using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.EntityFrameworkCore.Update;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NLog.Targets;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Cl;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.ClTables;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.WAM.Token.Inspector.Errors;
using TheFloowApi;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;

[SingletonService]
public interface ICommercialLinesOrchestrator
{
    Task<IAsyncEnumerable<CommercialTrips>> GetParticipantHistory(int participantSeqId);
    Task<CommercialPolicy> GetPolicy(string policyNumber);
    Task<Boolean> OptOut(int participantSeqId);

    Task<CommercialParticipant[]> GetParticpants(int PolicySeqId);
    Task RemoveOptOut(RemoveOptOutRequest request);
    Task<RemoveOptOutResponse> ReplaceDevice(RemoveOptOutRequest request);
    Task<ConnectionTimeline> GetConnectionTimeline(
        string policyNumber,
        int participantSeqId,
        string vin
    );
    Task<Resources.ExcludedDateRange[]> GetExcludedDateRange(int participantSeqId);
    Task<Int32> UpdateExcludedDate(
        int participantSeqId,
        DateTime startDate,
        DateTime endDate,
        string description
    );
    Task<Resources.ExcludedDateRange> AddExcludedDate(
        int participantSeqId,
        DateTime startDate,
        DateTime endDate,
        string description
    );
    Task DeleteExcludedDate(int participantSeqId, DateTime startDate);

    Task<VehicleUpdateDto> GetVehicleDetails(int vehicleSeqId);

    Task<CommercialPolicy> GetPolicyByDevice(string deviceSerialNumber);
    Task<CommercialPolicy> Update(CommercialPolicy request);

    Task<string> GetUspsShipTrackingNumber(int vehicleSeqId);
}

public class CommercialLinesOrchestrator : ICommercialLinesOrchestrator
{
    private readonly ICommonApi commonApi;
    private readonly CLContext dbContext;
    private readonly ILogger<CommercialLinesOrchestrator> logger;
    private readonly IDeviceService deviceService;
    private readonly IHomebaseDAL homebaseDAL;
    private readonly IPluginActionsOrchestrator pluginActionsOrchestrator;
    private readonly IMapper mapper;
    private readonly IRemoveOptOutService service;
    private readonly ITheFloowApiClient theFloowApiClient;
    public readonly IXirgoDeviceService xirgoDeviceService;

    public CommercialLinesOrchestrator(
        ICommonApi commonApi,
        CLContext dbContext,
        IDeviceService deviceService,
        IHomebaseDAL homebaseDAL,
        ILogger<CommercialLinesOrchestrator> logger,
        IPluginActionsOrchestrator pluginActionsOrchestrator,
        IMapper mapper,
        IRemoveOptOutService service,
        ITheFloowApiClient theFloowApiClient,
        IXirgoDeviceService xirgoDeviceService
    )
    {
        this.commonApi = commonApi;
        this.dbContext = dbContext;
        this.logger = logger;
        this.deviceService = deviceService;
        this.homebaseDAL = homebaseDAL;
        this.pluginActionsOrchestrator = pluginActionsOrchestrator;
        this.mapper = mapper;
        this.service = service;
        this.theFloowApiClient = theFloowApiClient;
        this.xirgoDeviceService = xirgoDeviceService;
    }

    private static readonly Func<CLContext, int, IAsyncEnumerable<CommercialTrip>> ParticipantTrips =
        EF.CompileAsyncQuery(
            (CLContext clContext, int id) =>
                (
                    from t in clContext.Trips
                    where
                        t.ParticipantSeqId == id
                        && t.TripStartDateTime > DateTime.Today.AddDays(-365)
                    orderby t.TripStartDateTime

                    select new CommercialTrip
                    {
                        Date = t.TripStartDateTime.Date,
                        StartDate = t.TripStartDateTime,
                        EndDate = t.TripEndDateTime,
                        Trips = 1,
                        Duration = t.TripEndDateTime - t.TripStartDateTime,
                        Distance = (double)t.TripKilometers,
                        HardBreaks = t.HardBrakes + t.HardBrakes,
                        Excluded = (
                            from e in clContext.ExcludedDateRanges
                            where
                                (
                                    e.RangeStart < t.TripStartDateTime
                                    && t.TripStartDateTime < e.RangeEnd
                                )
                                || (
                                    t.TripStartDateTime < e.RangeStart
                                    && e.RangeStart < t.TripEndDateTime
                                )
                            select true
                        ).FirstOrDefault()

                    }
                )
        );

    public async Task<IAsyncEnumerable<CommercialTrips>> GetParticipantHistory(int participantSeqId)
    {
        var trips = ParticipantTrips(dbContext, participantSeqId).ToEnumerable();
        var combinedByDate =
           (from trip in trips
            group trip by trip.Date into tripDates
            orderby tripDates.Key descending
            select new CommercialTrips
            {
                Date = tripDates.Key,
                Duration = TimeSpan.FromSeconds(tripDates.Sum(d => d.Duration.TotalSeconds)),
                Trips = tripDates.Sum(d => d.Trips),
                Distance = tripDates.Sum(d => d.Distance),
                HardBreaks = tripDates.Sum(d => d.HardBreaks),
                Excluded = tripDates.Select(d => d.Excluded).FirstOrDefault(),
                Details = (
                    from details in tripDates
                    select new CommercialTrip
                    {
                        StartDate = details.StartDate,
                        EndDate = details.EndDate,
                        Distance = details.Distance,
                        Duration = details.Duration,
                        Excluded = details.Excluded,
                        HardBreaks = details.HardBreaks
                    }
                ).ToArray()
            }
        ).ToAsyncEnumerable();
        return combinedByDate;
    }

    private static readonly Func<CLContext, string, Task<CommercialPolicy>> GetPolicyByNumberAsync =
        EF.CompileAsyncQuery(
            (CLContext clContext, string policyNumber) =>
                (
                    from pol in clContext.Policies
                    where pol.PolicyNumber == policyNumber
                    select new CommercialPolicy
                    {
                        PolicyNumber = pol.PolicyNumber,
                        PolicySeqId = pol.PolicySeqId,
                        CreatedDate = pol.CreateDateTime,
                        SendDashboard = pol.IsDashboardEligible ?? false,
                        Address = new CommercialAddress
                        {
                            Address1 = pol.Address1,
                            Address2 = pol.Address2,
                            City = pol.City,
                            State = pol.State,
                            PostalCode = pol.ZipCode,
                            ContactName = pol.Name,
                        },
                        EmailAddress = pol.EmailAddress,
                    }
                ).FirstOrDefault()
        );

    public async Task<CommercialPolicy> GetPolicy(string policyNumber)
    {
        return await GetPolicyByNumberAsync(dbContext, policyNumber);
    }

    private static readonly Func<
        CLContext,
        int,
        IEnumerable<CommercialParticipant>
    > GetParticpantByPolicySeq = EF.CompileQuery(
        (CLContext dbContext, int PolicySeqId) =>
            (
                from par in dbContext.Participants
                    .Where(p => p.PolicySeqId == PolicySeqId)
                    .OrderBy(p => p.ParticipantSeqId)
                from ps in dbContext.ParticipantStatuses.Where(
                    p => p.Code == par.ParticipantStatusCode
                )
                from v in dbContext.Vehicles
                    .Where(v => v.VehicleSeqId == par.VehicleSeqId)
                    .DefaultIfEmpty()
                from d in dbContext.DeviceOrderDetails
                    .Where(d => d.ParticipantSeqId == par.ParticipantSeqId ||
                    d.VehicleSeqId == v.VehicleSeqId && !d.IsCableOrderInd)
                    .OrderByDescending(d => d.CreateDateTime)
                    .DefaultIfEmpty()
                    .Take(1)
                from de in dbContext.DeviceEvents
                    .Where(de => de.DeviceSeqId == d.DeviceSeqId)
                    .OrderByDescending(d => d.CreateDateTime)
                    .DefaultIfEmpty()
                    .Take(1)
                from dr in dbContext.DeviceReturns
                    .Where(dr => dr.DeviceSeqId == par.DeviceSeqId)
                    .OrderByDescending(d => d.CreateDateTime)
                    .DefaultIfEmpty()
                    .Take(1)
                from devo in dbContext.DeviceOrders
                    .Where(devo => devo.DeviceOrderSeqId == d.DeviceOrderSeqId)
                    .DefaultIfEmpty()

                select new CommercialParticipant
                {
                    ParticipantSeqId = par.ParticipantSeqId,
                    ParticipantId = par.ParticipantId,
                    DeviceSeqId = d.DeviceSeqId ?? par.DeviceSeqId,
                    Status = ps.Description,
                    ChangeDate = par.LastUpdateDateTime,
                    YMM = String.Join(" ", v.Year, v.Make, v.Model),
                    VIN = v.Vin,
                    VehicleSeqId = v.VehicleSeqId,
                    EnrolledDate = par.CreateDateTime,
                    ShipDate = devo.ShipDateTime,
                    DeviceOrderId = devo.DeviceOrderSeqId,
                    DeviceReportedVIN = de.ReportedVin,
                    ReturnDate = dr.DeviceReceivedDateTime,
                    ReturnReason = dr.DeviceReturnReasonCode.ToString(),
                    AbandonDate = dr.DeviceAbandonedDateTime,
                    CableType = v.CableType
                }
            )
    );

    public async Task<CommercialParticipant[]> GetParticpants(int PolicySeqId)
    {
        var participants = GetParticpantByPolicySeq(dbContext, PolicySeqId);

        var parts = participants.ToArray();

        foreach (var part in parts)
        {
            if (part.DeviceSeqId != null)
            {
                var deviceDetails = await this.homebaseDAL
                    .GetDeviceDetailsAsync((int)part.DeviceSeqId)
                    .ConfigureAwait(false);
                part.SerialNumber = deviceDetails.DeviceSerialNumber;
                part.Sim = deviceDetails.SIM;
                part.ShipDate = deviceDetails.ShipDateTime;
                part.FirstContactDate = deviceDetails.FirstContactDateTime;
                part.LastContactDate = deviceDetails.LastContactDateTime;
                part.IsCommunicationAllowed = deviceDetails.IsCommunicationAllowed;
                part.deviceType = deviceDetails.Description;
                part.DeviceLocation = deviceDetails.LocationCode;
                part.DeviceStatus = deviceDetails.StatusCode;
                part.DeviceReportedVIN = deviceDetails.ReportedVIN;
            }
        }

        return parts;
    }

    public async Task<Boolean> OptOut(int participantSeqId)
    {
        await service.UpdateParticipantStatus(participantSeqId, ParticipantStatusCode.OptOut);
        return true;
    }

    public async Task RemoveOptOut(RemoveOptOutRequest request)
    {
        ErrorDetail error = null;

        // update participant for each vehicle to enrolled.
        if (request.RemoveOptOut)
        {
            await service.UpdateParticipantStatus(
                request.ParticipantSeqId,
                ParticipantStatusCode.Enrolled
            );
        }
    }

    public async Task<RemoveOptOutResponse> ReplaceDevice(RemoveOptOutRequest request)
    {
        // update vehicle IsHeavyTruck flag or CableType if vehicle update is requested.
        await service.UpdateVehicle(
            request.VehicleSeqId,
            request.UpdatedCableType,
            request.UpdatedHeavyTruckFlag
        );

        ICollection<DeviceOrderCreatedResponse> deviceOrderResponses =
            new List<DeviceOrderCreatedResponse>();

        int deviceOrderId = await service.CreateDeviceOrder(
            request.PolicySeqId,
            request.UpdatedHeavyTruckFlag
        );

        var detailIds = await service.CreateReplacementDeviceOrderDetails(
            deviceOrderId,
            request.ParticipantSeqId,
            request.VehicleSeqId,
            request.IsCableOrderInd
        );

        var deviceOrderResponse = new DeviceOrderCreatedResponse
        {
            NewDeviceOrderId = deviceOrderId,
            DeviceOrderDetailIds = detailIds
        };
        deviceOrderResponses.Add(deviceOrderResponse);

        return new RemoveOptOutResponse { CreatedDeviceOrders = deviceOrderResponses };
    }

    public async Task<ConnectionTimeline> GetConnectionTimeline(
        string policyNumber,
        int participantSeqId,
        string vin
    )
    {
        var model = new ConnectionTimeline();
        var pairs = new List<DisconnectionInterval>();
        var events =
            from e in dbContext.DeviceEvents
            where
                (e.DeviceEventTypeCode == 0 || e.DeviceEventTypeCode == 1)
                && e.DeviceEventDateTime > DateTime.Now.AddYears(-1)
            select e;

        DisconnectionInterval store = null;
        await events.ForEachAsync(e =>
        {
            if (store == null)
            {
                if (e.DeviceEventTypeCode == 1)
                    pairs.Add(new DisconnectionInterval { Connection = e.DeviceEventDateTime });
                else
                    store = new DisconnectionInterval { Disconnection = e.DeviceEventDateTime };
            }
            else
            {
                if (e.DeviceEventTypeCode == 1)
                {
                    store.Connection = e.DeviceEventDateTime;
                    pairs.Add(store);
                    store = null;
                }
                else
                {
                    pairs.Add(store);
                    store = new DisconnectionInterval { Disconnection = e.DeviceEventDateTime };
                }
            }
        });

        if (store != null)
            pairs.Add(store);

        model.EventPairs = pairs;
        return model;
    }

    public async Task<Resources.ExcludedDateRange[]> GetExcludedDateRange(int participantSeqId)
    {
        return await dbContext.ExcludedDateRanges
            .Where(e => e.ParticipantSeqId == participantSeqId)
            .Select(
                s =>
                    new Resources.ExcludedDateRange
                    {
                        RangeStart = DateTime.SpecifyKind(s.RangeStart, DateTimeKind.Local),
                        RangeEnd = DateTime.SpecifyKind(s.RangeEnd, DateTimeKind.Local),
                        LastChangeDateTime = s.CreateDate,
                        Description = s.Description
                    }
            )
            .ToArrayAsync();
    }

    public async Task<Int32> UpdateExcludedDate(
        int participantSeqId,
        DateTime startDate,
        DateTime endDate,
        string description
    )
    {
        var update = await dbContext.ExcludedDateRanges
            .Where(
                d =>
                    d.ParticipantSeqId == participantSeqId
                    && d.RangeStart == startDate.ToLocalTime()
            )
            .FirstAsync();

        update.RangeEnd = endDate;
        update.Description = description;

        dbContext.ExcludedDateRanges.Update(update);
        return await dbContext.SaveChangesAsync();
    }

    public async Task<Resources.ExcludedDateRange> AddExcludedDate(
        int participantSeqId,
        DateTime startDate,
        DateTime endDate,
        string description
    )
    {
        var newRange = new Services.Models.ClTables.ExcludedDateRange
        {
            ParticipantSeqId = participantSeqId,
            RangeStart = startDate.ToLocalTime(),
            RangeEnd = endDate.ToLocalTime(),
            Description = description
        };
        dbContext.ExcludedDateRanges.Add(newRange);
        await dbContext.SaveChangesAsync();
        return new Resources.ExcludedDateRange
        {
            RangeStart = startDate,
            RangeEnd = endDate,
            Description = description
        };
    }

    public Task DeleteExcludedDate(int participantSeqId, DateTime startDate)
    {
        dbContext.ExcludedDateRanges.Remove(
            new Services.Models.ClTables.ExcludedDateRange
            {
                ParticipantSeqId = participantSeqId,
                RangeStart = startDate
            }
        );
        return dbContext.SaveChangesAsync();
    }

    public async Task<VehicleUpdateDto> GetVehicleDetails(int vehicleSeqId)
    {
        var vehicle = await dbContext.Vehicles
            .Where(v => v.VehicleSeqId == vehicleSeqId)
            .FirstOrDefaultAsync();
        if (vehicle == null)
        {
            return null;
        }
        return new VehicleUpdateDto
        {
            VehicleSeqId = vehicleSeqId,
            IsHeavyTruck = vehicle.IsHeavyTruck ?? false,
            CableType = vehicle.CableType ?? ""
        };
    }

    public async Task<CommercialPolicy> GetPolicyByDevice(string deviceSerialNumber)
    {
        var device = await xirgoDeviceService.GetDeviceBySerialNumber(deviceSerialNumber);
        if (device?.Device?.DeviceSeqID == null)
        {
            return null;
        }
        var policyNumber = PolicyNumberByDeviceSeqId(dbContext, device.Device.DeviceSeqID.Value);

        var policy = await GetPolicyByNumberAsync(dbContext, policyNumber);
        if (policy == null)
        {
            return null;
        }

        policy.Participants = await this.GetParticpants(policy.PolicySeqId);
        return policy;
    }

    public async Task<CommercialPolicy> Update(CommercialPolicy request)
    {
        var update = await dbContext.Policies
            .Where(d => d.PolicySeqId == request.PolicySeqId)
            .FirstAsync();

        if (update.IsDashboardEligible != request.SendDashboard)
        {
            var message = await theFloowApiClient.UpdateEmailAddress(update.PolicyNumber, update.EmailAddress);
        }

        update.Name = request.Address.ContactName;
        update.Address1 = request.Address.Address1;
        update.Address2 = request.Address.Address2;
        update.City = request.Address.City;
        update.State = request.Address.State;
        update.ZipCode = request.Address.PostalCode;
        update.EmailAddress = request.EmailAddress;
        update.IsDashboardEligible = request.SendDashboard;

        dbContext.Policies.Update(update);
        await dbContext.SaveChangesAsync();
        var policy = await GetPolicy(update.PolicyNumber);
        if (policy == null)
        {
            return null;
        }
        policy.Participants = await GetParticpants(policy.PolicySeqId);

        return policy;
    }

    private static readonly Func<CLContext, int, string> PolicyNumberByDeviceSeqId =
        EF.CompileQuery(
            (CLContext clContext, int id) =>
                (
                    from p in clContext.Participants
                    where p.DeviceSeqId == id
                    join PS in clContext.ParticipantStatuses
                        on p.ParticipantStatusCode equals PS.Code
                    join POL in clContext.Policies on p.PolicySeqId equals POL.PolicySeqId
                    select POL.PolicyNumber
                ).FirstOrDefault()
        );


    public async Task<int?> GetMostRecentDeviceOrderSeqIdByVehicleSeqId(int vehicleSeqId)
    {
        var param = new SqlParameter("@Parm_VehicleSeqIDList", vehicleSeqId.ToString());

        List<CommercialLinesOrderDTO> results = await dbContext.Database.SqlQueryRaw<CommercialLinesOrderDTO>
            ("EXEC dbo.usp_DeviceOrderDetail_SelectMostRecentByVehicleSeqID @Parm_VehicleSeqIDList", param).ToListAsync();

        return results.FirstOrDefault()?.OrderSeqId;
    }

    public async Task<string> GetUspsShipTrackingNumber(int vehicleSeqId)
    {
        // 1. Get the most recent DeviceOrderSeqId from UBICL
        int? orderSeqId = await GetMostRecentDeviceOrderSeqIdByVehicleSeqId(vehicleSeqId);
        if (orderSeqId == null)
            return null;

        // 2. Get the tracking number from UBIHomeBase
        string trackingNumber = await homebaseDAL.GetUspsShipTrackingNumberByOrderSeqId(orderSeqId.Value);
        return trackingNumber;
    }

}
