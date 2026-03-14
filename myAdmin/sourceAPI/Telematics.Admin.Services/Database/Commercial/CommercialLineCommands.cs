using System;
using Microsoft.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Dapper;
using Microsoft.Extensions.Configuration;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Models.ClTables;

namespace Progressive.Telematics.Admin.Services.Database.CommercialLines;

public interface ICommercialLineCommands
{
    Task<int> CreateDeviceOrder(DeviceOrderDto deviceOrder);

    Task<int> CreateDeviceOrderDetail(DeviceOrderDetailDto orderDetail);

    Task<int> UpdateVehicle(int vehicleSeqId, string UpdatedCableType, bool? UpdatedHeavyTruckFlag);

    Task UpdateParticipantStatus(int participantSeqId, ParticipantStatusCode participantStatusCode);
}

public class CommercialLineCommands : ICommercialLineCommands
{
    private readonly IConfiguration config;

    public readonly CLContext clContext;
    private readonly IMapper mapper;

    public CommercialLineCommands(IConfiguration configuration, CLContext clContext, IMapper mapper)
    {
        config = configuration;
        this.clContext = clContext;
        this.mapper = mapper;
    }

    public async Task<int> CreateDeviceOrder(DeviceOrderDto deviceOrder)
    {
        deviceOrder.ProcessedDateTime = DateTime.Now;
        var added = mapper.Map<DeviceOrder>(deviceOrder);
        clContext.DeviceOrders.Add(added);
        await clContext.SaveChangesAsync();
        return added.DeviceOrderSeqId;
    }

    public async Task<int> CreateDeviceOrderDetail(DeviceOrderDetailDto orderDetail)
    {
        var added = mapper.Map<DeviceOrderDetail>(orderDetail);
        clContext.DeviceOrderDetails.Add(added);
        await clContext.SaveChangesAsync();
        return added.DeviceOrderSeqId;
    }

    public async Task<int> UpdateVehicle(
        int vehicleSeqId,
        string UpdatedCableType,
        bool? UpdatedHeavyTruckFlag
    )
    {
        var vehicle = clContext.Vehicles
            .Where(x => x.VehicleSeqId == vehicleSeqId)
            .FirstOrDefault();
        vehicle.CableType = UpdatedCableType;
        vehicle.IsHeavyTruck = UpdatedHeavyTruckFlag;
        clContext.Vehicles.Update(vehicle);
        return await clContext.SaveChangesAsync();
    }

    public async Task UpdateParticipantStatus(
        int participantSeqId,
        ParticipantStatusCode participantStatusCode
    )
    {
        var particiapantHistory = this.clContext.Participants
            .Where(p => p.ParticipantSeqId == participantSeqId)
            .First();
        this.clContext.ParticipantHistories.Add(
            mapper.Map<ParticipantHistory>(particiapantHistory)
        );
        particiapantHistory.ParticipantStatusCode = (int)participantStatusCode;
        this.clContext.Participants.Update(particiapantHistory);
        await this.clContext.SaveChangesAsync();
        return;
    }
}

public class DeviceOrderDto
{
    public int DeviceOrderStatusCode { get; set; }
    public int PolicySeqId { get; set; }
    public bool? IsHeavyTruck { get; set; }
    public int DeviceOrderSeqId { get; set; }
    public DateTime ProcessedDateTime { get; set; }
}

public class DeviceOrderDetailDto
{
    public int DeviceOrderId { get; set; }
    public int ParticipantSeqId { get; set; }
    public int VehicleSeqId { get; set; }
    public bool IsReplacementOrder { get; set; }
    public bool IsCableOrderInd { get; set; }
    public int? DeviceSeqId { get; internal set; }
}
