using System;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfSimManagementService;
using WcfXirgoService;
using ResponseStatus = WcfXirgoService.ResponseStatus;
using ISimManagementService = Progressive.Telematics.Labs.Services.Wcf.ISimManagementService;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Device;


public record DeviceRecoveryResult(bool Success);

[SingletonService]
public interface IDeviceRecoveryService
{
    Task<DeviceRecoveryResult> RecoverDeviceAsync(XirgoDevice device, ParticipantInfo participant, Resource response, int? reasonCode = null);
}

public class DeviceRecoveryService(
    IXirgoDeviceService deviceService,
    ISimManagementService simManagementService,
    IDeviceReturnDAL deviceReturnDal,
    ILogger<DeviceRecoveryService> logger) : IDeviceRecoveryService
{
    public async Task<DeviceRecoveryResult> RecoverDeviceAsync(XirgoDevice device, ParticipantInfo participant, Resource response, int? reasonCode = null)
    {
        using TransactionScope scope = new(TransactionScopeAsyncFlowOption.Enabled);
        CheckForValidDevice(device);
        var wasSuccessful = true;

        var updateDeviceResponse = await deviceService.UpdateXirgoDevice(
            device.DeviceSeqID!.Value,
            (DeviceStatus)device.StatusCode!,
            (DeviceLocation)device.LocationCode!);

        if (updateDeviceResponse.ResponseStatus == ResponseStatus.Failure)
        {
            var errors = string.Join<object>(", ", updateDeviceResponse.ResponseErrors);
            logger.LogError(LoggingEvents.DeviceRecoveryService_UpdateDevice_Error,
                "Failed to update device with error {error}", errors);
            if (response.Messages == null || !response.Messages.ContainsKey(MessageCode.ErrorCode))
            {
                response.AddMessage(MessageCode.ErrorCode, "FailedToUpdateDevice");
            }
            AppendErrorDetail(response, errors);
            wasSuccessful = false;
        }

        var returnReason = reasonCode.HasValue
            ? (DeviceReturnReasonCode)reasonCode.Value
            : GetReturnReason((int)device.StatusCode!);

        var simSuccess = await DeactivateDevice(device);
        if (!simSuccess)
        {
            logger.LogError(LoggingEvents.DeviceRecoveryService_DeactivateSim_Error,
                "Failed to deactivate SIM for device {DeviceSeqId}", device.DeviceSeqID);
            if (response.Messages == null || !response.Messages.ContainsKey(MessageCode.ErrorCode))
            {
                response.AddMessage(MessageCode.ErrorCode, "FailedToDeactivateSim");
            }
            AppendErrorDetail(response, "SIM deactivation did not succeed");
            wasSuccessful = false;
        }

        var deviceReturn = await deviceReturnDal.GetDeviceReturn(new GetDeviceReturnModel
        {
            ParticipantSeqID = participant.ParticipantSeqID,
            DeviceSeqID = device.DeviceSeqID!.Value
        });

        if (deviceReturn != null)
        {
            if (returnReason == DeviceReturnReasonCode.Abandoned && reasonCode == null)
            {
                deviceReturn.DeviceAbandonedDateTime = DateTime.Now;
            }

            deviceReturn.DeviceReturnReasonCode = (int)returnReason;
            await deviceReturnDal.UpdateDeviceReturn(new UpdateDeviceReturnModel { DeviceReturn = deviceReturn });
        }
        else
        {
            var newDeviceReturn = new DeviceReturnModel
            {
                DeviceSeqID = device.DeviceSeqID!.Value,
                ParticipantSeqID = participant.ParticipantSeqID,
                DeviceReturnReasonCode = (int)returnReason,
                VehicleSeqID = participant.VehicleSeqID,
                DeviceAbandonedDateTime = (returnReason == DeviceReturnReasonCode.Abandoned && reasonCode == null)
                    ? DateTime.Now
                    : null
            };

            await deviceReturnDal.AddDeviceReturn(new AddDeviceReturnModel { DeviceReturn = newDeviceReturn });
        }

        if (wasSuccessful)
        {
            scope.Complete();
        }

        return new DeviceRecoveryResult(wasSuccessful);
    }

    private async Task<bool> DeactivateDevice(XirgoDevice device)
    {
        AddSimManagementRequest req = new()
        {
            Action = ActionType.Deactivate,
            SIM = device.SIM,
            EffectiveDate = DateTime.Now
        };
        AddSimManagementResponse response = await simManagementService.Add(req);

        return response.ResponseStatus == WcfSimManagementService.ResponseStatus.Success;
    }

    private static DeviceReturnReasonCode GetReturnReason(int statusCode)
    {
        return (DeviceStatus)statusCode switch
        {
            DeviceStatus.Abandoned => DeviceReturnReasonCode.Abandoned,
            DeviceStatus.Defective => DeviceReturnReasonCode.DeviceProblem,
            DeviceStatus.Assigned => DeviceReturnReasonCode.DeviceReplaced,
            _ => throw new Exception("Unsupported status code for device recovery")
        };
    }

    private static void CheckForValidDevice(XirgoDevice device)
    {
        if (device.DeviceSeqID == null)
        {
            throw new Exception("Device cannot be recovered with missing DeviceSeqId");
        }

        if (device.StatusCode == null)
        {
            throw new Exception("Status code must be set in order to update the device for recovery");
        }

        if (device.LocationCode == null)
        {
            throw new Exception("Location code must be set in order to update device for recovery");
        }
    }

    private static void AppendErrorDetail(Resource response, string detail)
    {
        if (response.Messages != null && response.Messages.TryGetValue(MessageCode.ErrorDetails, out var existing) && existing is string existingText && !string.IsNullOrWhiteSpace(existingText))
        {
            response.Messages[MessageCode.ErrorDetails] = string.Concat(existingText, "; ", detail);
        }
        else
        {
            response.AddMessage(MessageCode.ErrorDetails, detail);
        }
    }
}
