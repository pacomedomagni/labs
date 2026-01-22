using System;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Orchestrators.Device;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Account;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;


namespace Progressive.Telematics.Labs.Business.Orchestrators.Vehicle;

[SingletonService]
public interface IParticipantOrchestrator
{
    Task<AccountCollectionResponse> AddParticipant(AddAccountParticipantRequest request);
    Task<EditVehicleResponse> EditVehicle(EditVehicleRequest request);
    Task<UpdateParticipantNicknameResponse> UpdateParticipantNickname(UpdateParticipantNicknameRequest request);
    Task<Resource> OptOut(OptOutParticipantRequest request);
    Task<UpdateVehicleStatusResponse> UpdateVehicleStatus(int participantSeqID, bool isActive);
}

public class ParticipantOrchestrator(
    IParticipantDAL participantDal,
    IAccountDAL accountDal,
    IXirgoDeviceService deviceService,
    IDeviceRecoveryService deviceRecoveryService,
    ILogger<ParticipantOrchestrator> logger) : IParticipantOrchestrator
{
    private const string DEVICE_ORDER_FAILED = "Add participant failed to generate a device order";
    private const string VEHICLE_NOT_FOUND = "Vehicle with VehicleSeqID {0} not found";
    private const DeviceReturnReasonCode DEVICE_RETURN_REASON_OPT_OUT = DeviceReturnReasonCode.OptOut;

    public async Task<AccountCollectionResponse> AddParticipant(AddAccountParticipantRequest request)
    {
        try
        {
            using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            int deviceOrderSeqId = await participantDal.AddParticipant(request);

            var response = new AccountCollectionResponse();

            if (deviceOrderSeqId == 0)
            {
                response.AddMessage(MessageCode.StatusDescription, DEVICE_ORDER_FAILED);
                response.AddMessage(MessageCode.Handled, true);
            }
            else
            {
                response.AddMessage(MessageCode.StatusDescription, "Participant added successfully");
            }

            scope.Complete();
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(LoggingEvents.ParticipantOrchestrator_AddParticipant_Error, ex,
                "Failed adding participant for ParticipantGroupSeqID: {ParticipantGroupSeqID}",
                request.ParticipantGroupSeqId);
            throw;
        }
    }

    public async Task<EditVehicleResponse> EditVehicle(EditVehicleRequest request)
    {
        var response = new EditVehicleResponse();

        if (request?.ChangedVehicle == null)
        {
            response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
            response.AddMessage(MessageCode.ErrorDetails, "Vehicle information is required");
            return response;
        }

        try
        {
            using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var updatedVehicle = await participantDal.UpdateVehicle(request.ChangedVehicle);

            if (updatedVehicle == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "VehicleNotFound");
                response.AddMessage(MessageCode.ErrorDetails,
                    string.Format(VEHICLE_NOT_FOUND, request.ChangedVehicle.VehicleSeqID));
                response.AddMessage(MessageCode.Handled, true);
            }
            else
            {
                response.ChangedVehicle = updatedVehicle;
                response.AddMessage(MessageCode.StatusDescription, "Vehicle updated successfully");
            }

            scope.Complete();
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(LoggingEvents.ParticipantOrchestrator_EditVehicle_Error, ex,
                "Failed updating vehicle with VehicleSeqID: {VehicleSeqID}",
                request?.ChangedVehicle?.VehicleSeqID);
            throw;
        }
    }

    public async Task<UpdateParticipantNicknameResponse> UpdateParticipantNickname(UpdateParticipantNicknameRequest request)
    {
        var response = new UpdateParticipantNicknameResponse();

        if (request == null)
        {
            response.AddMessage(MessageCode.ErrorCode, "The request payload was missing required data.");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        if (request.ParticipantSeqID <= 0)
        {
            response.AddMessage(MessageCode.ErrorCode, "Participant sequence ID must be greater than zero.");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        var sanitizedNickname = string.IsNullOrWhiteSpace(request.Nickname)
            ? null
            : request.Nickname.Trim();

        if (string.IsNullOrEmpty(sanitizedNickname))
        {
            response.AddMessage(MessageCode.ErrorCode, "Nickname must contain at least one non-whitespace character.");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        try
        {
            await participantDal.UpdateParticipantNickname(request.ParticipantSeqID, sanitizedNickname);

            var participant = await participantDal.GetParticipantBySeqId(request.ParticipantSeqID);
            if (participant == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "Participant was not found.");
                response.AddMessage(MessageCode.Handled, true);
                return response;
            }

            response.Participant = participant;
            response.AddMessage(MessageCode.StatusDescription, "Participant nickname updated successfully");

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(LoggingEvents.ParticipantOrchestrator_UpdateNickname_Error, ex,
                "Failed to update participant nickname for ParticipantSeqID {ParticipantSeqID}",
                request.ParticipantSeqID);
            throw;
        }
    }

    public async Task<Resource> OptOut(OptOutParticipantRequest request)
    {
        var response = new Resource();

        if (request == null)
        {
            response.AddMessage(MessageCode.ErrorCode, "OptOutInvalidRequest");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        if (request.ParticipantSequenceId <= 0)
        {
            response.AddMessage(MessageCode.ErrorCode, "ParticipantSequenceInvalid");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        var participant = await participantDal.GetParticipantBySeqId(request.ParticipantSequenceId);
        if (participant == null)
        {
            response.AddMessage(MessageCode.ErrorCode, "ParticipantNotFound");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        if (participant.ParticipantGroupSeqID <= 0)
        {
            response.AddMessage(MessageCode.ErrorCode, "ParticipantGroupInvalid");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        var accounts = await accountDal.GetAccountsByParticipantGroupSeqId(participant.ParticipantGroupSeqID);
        var account = accounts?.FirstOrDefault(a => a.ParticipantSeqID == participant.ParticipantSeqID);
        if (account == null)
        {
            response.AddMessage(MessageCode.ErrorCode, "ParticipantAccountNotFound");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        if (account.ParticipantStatusCode == (int)ParticipantStatus.OptOut)
        {
            response.AddMessage(MessageCode.Handled, true);
            response.AddMessage(MessageCode.StatusDescription, "Participant already opted out");
            return response;
        }

        if (IsDeviceExperience(account.DeviceExperienceTypeCode) && participant.DeviceSeqID.HasValue)
        {
            var deviceSerialNumber = !string.IsNullOrWhiteSpace(request.DeviceSerialNumber)
                ? request.DeviceSerialNumber
                : account.DeviceSerialNumber;

            if (!string.IsNullOrWhiteSpace(deviceSerialNumber))
            {
                var deviceLookup = await deviceService.GetDeviceBySerialNumber(deviceSerialNumber);
                var device = deviceLookup?.Device;

                    if (device != null)
                    {
                        var previousStatus = device.StatusCode;
                        if (previousStatus == (int)DeviceStatus.Assigned)
                        {
                            device.StatusCode = (int)DeviceStatus.CustomerReturn;
                        }

                        var previousLocation = device.LocationCode;
                        if (previousLocation == (int)DeviceLocation.ShippedToCustomer || previousLocation == (int)DeviceLocation.InVehicle)
                        {
                            device.LocationCode = (int)DeviceLocation.Unknown;
                        }

                        var recoveryResult = await deviceRecoveryService.RecoverDeviceAsync(
                            device,
                            participant,
                            response,
                            (int)DEVICE_RETURN_REASON_OPT_OUT);

                        if (!recoveryResult.Success)
                        {
                            return response;
                        }
                    }
                else
                {
                    logger.LogWarning(
                        "OptOut: Device lookup failed for serial {DeviceSerialNumber} and participant {ParticipantSeqId}",
                        deviceSerialNumber,
                        request.ParticipantSequenceId);
                }
            }
        }

        await participantDal.UpdateParticipantStatus(participant.ParticipantSeqID, (int)ParticipantStatus.OptOut);
        await participantDal.CancelPendingDeviceOrders(participant.ParticipantSeqID, DeviceOrderStatus.New, DeviceOrderStatus.Cancelled);

        if (response.Messages == null || !response.Messages.ContainsKey(MessageCode.ErrorCode))
        {
            response.AddMessage(MessageCode.StatusDescription, "Opt Out Successful");
        }

        return response;
    }

    public async Task<UpdateVehicleStatusResponse> UpdateVehicleStatus(int participantSeqID, bool isActive)
    {
        var response = new UpdateVehicleStatusResponse();

        if (participantSeqID <= 0)
        {
            response.AddMessage(MessageCode.ErrorCode, "participantSeqID");
            response.AddMessage(MessageCode.ErrorDetails, "Participant sequence ID must be greater than zero.");
            response.AddMessage(MessageCode.Handled, true);
            return response;
        }

        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        var deleted = await participantDal.UpdateVehicleStatus(participantSeqID, isActive);

        if (!deleted)
        {
            response.AddMessage(MessageCode.ErrorCode, "VehicleNotFound");
            response.AddMessage(MessageCode.ErrorDetails,
            string.Format(VEHICLE_NOT_FOUND, participantSeqID));
            response.AddMessage(MessageCode.Handled, true);
        }
        else
        {
            var message = isActive ? "Vehicle added successfully" : "Vehicle deleted successfully";
            response.ParticipantSeqID = participantSeqID;
            response.AddMessage(MessageCode.StatusDescription, message);
        }
        scope.Complete();
        return response;
    }

    private static bool IsDeviceExperience(int? deviceExperienceTypeCode)
    {
        return deviceExperienceTypeCode == (int)DeviceExperience.Device;
    }
}
