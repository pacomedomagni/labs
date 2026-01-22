using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Account;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Account;

[SingletonService]
public interface IAccountOrchestrator
{
    Task<AccountCollectionResponse> GetAccountsByParticipantGroupSeqId(int participantGroupSeqId);
}

public class AccountOrchestrator : IAccountOrchestrator
{
    private readonly IAccountDAL _accountDal;
    private readonly IDeviceOrderDAL _deviceOrderDal;
    private readonly IDeviceReturnDAL _deviceReturnDal;
    private readonly ILabsMyScoreDeviceDAL _labsMyScoreDeviceDal;
    private readonly IXirgoDeviceService _xirgoDeviceService;
    private readonly ILogger<AccountOrchestrator> _logger;

    public AccountOrchestrator(
        IAccountDAL accountDal,
        IDeviceReturnDAL deviceReturnDal,
        ILabsMyScoreDeviceDAL labsMyScoreDeviceDal,
        ILogger<AccountOrchestrator> logger,
        IDeviceOrderDAL deviceOrderDal,
        IXirgoDeviceService xirgoDeviceService)
    {
        _accountDal = accountDal;
        _deviceReturnDal = deviceReturnDal;
        _deviceOrderDal = deviceOrderDal;
        _labsMyScoreDeviceDal = labsMyScoreDeviceDal;
        _xirgoDeviceService = xirgoDeviceService;
        _logger = logger;
    }

    public async Task<AccountCollectionResponse> GetAccountsByParticipantGroupSeqId(int participantGroupSeqId)
    {
        try
        {
            var records = (await _accountDal.GetAccountsByParticipantGroupSeqId(participantGroupSeqId))?
                .Where(record => record != null)
                .ToList() ?? new();

            var deviceOrders = await _deviceOrderDal.GetDeviceOrdersByParticipantGroupSeqId(participantGroupSeqId);

            await HydrateDeviceDetailsAsync(records);

            var accounts = records
                .Select(MapAccount)
                .ToArray();

            AssignOpenDeviceOrder(accounts, deviceOrders);

            return new AccountCollectionResponse
            {
                Accounts = accounts,
                RecordCount = accounts.Length
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.AccountOrchestrator_GetAccounts_Error, ex,
                "Failed to get accounts for participantGroupSeqId {ParticipantGroupSeqId}", participantGroupSeqId);
            throw;
        }
    }

    private void AssignOpenDeviceOrder(AccountSummary[] data, IEnumerable<DeviceOrderDetails> deviceOrders)
    {
        // Build a lookup for quick access by ParticipantSeqID
        var deviceOrdersByParticipant = deviceOrders
            .Where(t => t.DeviceOrderStatus == Progressive.Telematics.Labs.Business.Resources.Resources.Device.DeviceOrderStatus.New)
            .ToLookup(t => t.ParticipantSeqID);

        foreach (var account in data)
        {
            if (deviceOrdersByParticipant.Contains(account.Participant.ParticipantSeqID))
            {
                // A participant should only have one open device order, but handle in the event of more
                var mostRecentDeviceOrder = deviceOrdersByParticipant[account.Participant.ParticipantSeqID]
                    .OrderByDescending(t => t.CreateDateTime).FirstOrDefault();
                account.Participant.OpenDeviceOrder = mostRecentDeviceOrder;
            }
        }
    }

    private async Task HydrateDeviceDetailsAsync(IList<AccountDataModel> accounts)
    {
        if (accounts == null || accounts.Count == 0)
        {
            return;
        }

        var deviceSeqIds = accounts
            .Select(account => account.DeviceSeqID)
            .Where(id => id.HasValue)
            .Select(id => id.Value)
            .Distinct()
            .ToArray();

        if (deviceSeqIds.Length == 0)
        {
            return;
        }

        var deviceReturnResults = await _deviceReturnDal.GetLatestByDeviceSeqIds(deviceSeqIds);

        var deviceReturns = deviceReturnResults?
            .Where(item => item != null)
            .ToDictionary(item => item.DeviceSeqID)
            ?? new Dictionary<int, DeviceReturnByDeviceModel>();

        if (deviceReturnResults == null)
        {
            _logger.LogWarning("HydrateDeviceDetailsAsync: device return lookup returned null.");
        }

        var homebaseResults = await _labsMyScoreDeviceDal.GetDevicesBySeqIds(deviceSeqIds);

        var homebaseDevices = homebaseResults?
            .Where(item => item != null)
            .ToDictionary(item => item.DeviceSeqID)
            ?? new Dictionary<int, HomebaseDeviceDataModel>();

        if (homebaseResults == null)
        {
            _logger.LogWarning("HydrateDeviceDetailsAsync: homebase lookup returned null.");
        }
        

        foreach (var account in accounts)
        {
            if (!account.DeviceSeqID.HasValue)
            {
                continue;
            }

            var deviceSeqId = account.DeviceSeqID.Value;

            if (deviceReturns.TryGetValue(deviceSeqId, out var deviceReturn))
            {
                account.DeviceReturnReasonCode = deviceReturn.DeviceReturnReasonCode;
                account.DeviceReceivedDateTime = deviceReturn.DeviceReceivedDateTime;
                account.DeviceAbandonedDateTime = deviceReturn.DeviceAbandonedDateTime;
            }

            if (homebaseDevices.TryGetValue(deviceSeqId, out var deviceDetail))
            {
                account.DeviceSerialNumber = deviceDetail.DeviceSerialNumber;
                account.SIM = deviceDetail.SIM;
                account.DeviceStatusCode = deviceDetail.DeviceStatusCode;
                account.DeviceLocationCode = deviceDetail.DeviceLocationCode;
                account.DeviceManufacturer = deviceDetail.DeviceManufacturer;
                account.DeviceTypeDescription = deviceDetail.DeviceTypeDescription;
                account.ReportedVIN = deviceDetail.ReportedVIN;
                account.DeviceShipDateTime = deviceDetail.DeviceShipDateTime;
                account.FirstContactDateTime = deviceDetail.FirstContactDateTime;
                account.LastContactDateTime = deviceDetail.LastContactDateTime;
                account.LastUploadDateTime = deviceDetail.LastUploadDateTime;
                account.Features = deviceDetail.Features;
            }
        }

        // Fetch device features from WCF for all devices with serial numbers
        await HydrateDeviceFeaturesAsync(accounts);
    }

    private async Task HydrateDeviceFeaturesAsync(IList<AccountDataModel> accounts)
    {
        if (accounts == null || accounts.Count == 0)
        {
            return;
        }

        var devicesWithSerialNumbers = accounts
            .Where(a => !string.IsNullOrEmpty(a.DeviceSerialNumber))
            .ToList();

        if (devicesWithSerialNumbers.Count == 0)
        {
            return;
        }

        // Fetch features for each device in parallel
        var featureTasks = devicesWithSerialNumbers
            .Select(PopulateDeviceFeaturesAsync);

        await Task.WhenAll(featureTasks);
    }

    private async Task PopulateDeviceFeaturesAsync(AccountDataModel account)
    {
        try
        {
            var response = await _xirgoDeviceService.DeviceFeatures(account.DeviceSerialNumber);

            account.Features = response?.Features?
                .Select(f => MapWcfFeatureCodeToEnum(f.Code))
                .Where(feature => feature.HasValue)
                .Select(feature => feature.Value)
                .ToList()
                ?? new List<DeviceFeature>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch device features for serial {Serial}", account.DeviceSerialNumber);
            account.Features = new List<DeviceFeature>();
        }
    }

    private static DeviceFeature? MapWcfFeatureCodeToEnum(int code)
    {
        return code switch
        {
            1 => DeviceFeature.Audio,
            2 => DeviceFeature.BlueLight,
            3 => DeviceFeature.Accelerometer,
            4 => DeviceFeature.GPS,
            5 => DeviceFeature.GPSToggle,
            6 => DeviceFeature.AWSIot,
            _ => null
        };
    }

    private static AccountSummary MapAccount(AccountDataModel data)
    {
        if (data == null)
        {
            return new AccountSummary();
        }

        var account = new AccountSummary();

        account.Participant.ParticipantSeqID = data.ParticipantSeqID;
        account.Participant.ParticipantGroupSeqID = data.ParticipantGroupSeqID;
        account.Participant.ParticipantStatusCode = data.ParticipantStatusCode;
        account.Participant.ScoreCalculatorCode = data.ScoreCalculatorCode;
        account.Participant.ScoringAlgorithmCode = data.ScoringAlgorithmCode;
        account.Participant.LastUpdateDateTime = data.LastUpdateDateTime;
        account.Participant.ParticipantCreateDateTime = data.ParticipantCreateDateTime;
        account.Participant.ParticipantExternalID = data.ParticipantExternalID;
        account.Participant.ParticipantId = data.ParticipantId;

        account.Vehicle.VehicleSeqID = data.VehicleSeqID;
        account.Vehicle.VIN = data.VIN;
        account.Vehicle.Year = data.Year;
        account.Vehicle.Make = data.Make;
        account.Vehicle.Model = data.Model;
        account.Vehicle.VehicleCreateDateTime = data.VehicleCreateDateTime;

        account.Device.DeviceSeqID = data.DeviceSeqID;
        account.Device.DeviceExperienceTypeCode = data.DeviceExperienceTypeCode;
        account.Device.DeviceSerialNumber = data.DeviceSerialNumber;
        account.Device.SIM = data.SIM;
        account.Device.DeviceStatusCode = data.DeviceStatusCode;
        account.Device.DeviceLocationCode = data.DeviceLocationCode;
        account.Device.DeviceManufacturer = data.DeviceManufacturer;
        account.Device.DeviceTypeDescription = data.DeviceTypeDescription;
        account.Device.ReportedVIN = data.ReportedVIN;
        account.Device.DeviceShipDateTime = data.DeviceShipDateTime;
        account.Device.FirstContactDateTime = data.FirstContactDateTime;
        account.Device.LastContactDateTime = data.LastContactDateTime;
        account.Device.LastUploadDateTime = data.LastUploadDateTime;
        account.Device.DeviceReceivedDateTime = data.DeviceReceivedDateTime;
        account.Device.DeviceReturnReasonCode = data.DeviceReturnReasonCode;
        account.Device.DeviceAbandonedDateTime = data.DeviceAbandonedDateTime;
        account.Device.Features = data.Features;

        account.Driver.DriverSeqId = data.DriverSeqId;
        account.Driver.DriverExternalId = data.DriverExternalId;
        account.Driver.Nickname = data.Nickname;
        account.Driver.MobileSummarizerVersionCode = data.MobileSummarizerVersionCode;

        return account;
    }

}
