using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;
using Progressive.Telematics.Labs.Services.Api;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfDeviceActivityService;
using WcfXirgoService;
using BusinessPingDeviceRequest = Progressive.Telematics.Labs.Business.Resources.Resources.Device.PingDeviceRequest;
using BusinessResetDeviceRequest = Progressive.Telematics.Labs.Business.Resources.Resources.Device.ResetDeviceRequest;

#nullable enable

namespace Progressive.Telematics.Labs.Business.Orchestrators.Device
{
    [SingletonService]
    public interface IDeviceOrchestrator
    {
        Task<Resource> MarkDefective(MarkDefectiveRequest request);
        Task<Resource> MarkAbandoned(MarkAbandonedRequest request);
        Task<Resource> ReplaceDevice(ReplaceDeviceRequest request);
        Task<Resource> SwapDevice(SwapDeviceRequest request);
        Task<Resource> PingDevice(BusinessPingDeviceRequest request);
        Task<Resource> ResetDevice(BusinessResetDeviceRequest request);
        Task<Resource> GetAudioStatusAWS(GetAudioStatusAWSRequest request);
        Task<Resource> SetAudioStatusAWS(SetAudioStatusAWSRequest request);
        Task<Resource> UpdateAudio(UpdateAudioRequest request);
    }

    public class DeviceOrchestrator(ILogger<DeviceOrchestrator> logger,
        IParticipantDAL participantDal,
        IXirgoDeviceService deviceService,
        Progressive.Telematics.Labs.Services.Wcf.IDeviceActivityService deviceActivityService,
        ILabsMyScoreDeviceDAL labsMyScoreDeviceDal,
        IDeviceOrderDAL deviceOrderDal,
        IDeviceRecoveryService deviceRecoveryService,
        IAccountDAL accountDal,
        IDeviceApi deviceApi) : IDeviceOrchestrator
    {
        private const int ENROLLED_STATUS_CODE = 1;

        public async Task<Resource> MarkDefective(MarkDefectiveRequest request)
        {
            var response = new Resource();
            var participant = await participantDal.GetParticipantBySeqId(request.ParticipantSequenceId);
            if (participant == null)
            {
                return response;
            }

            var deviceResponse = await deviceService.GetDeviceBySerialNumber(request.DeviceSerialNumber);
            var device = deviceResponse?.Device
                ?? throw new InvalidOperationException($"Device not found for serial number {request.DeviceSerialNumber}");

            device.StatusCode = (int)DeviceStatus.Defective;

            await deviceRecoveryService.RecoverDeviceAsync(device, participant, response);
            return response;
        }

        public async Task<Resource> MarkAbandoned(MarkAbandonedRequest request)
        {
            var response = new Resource();
            var participant = await participantDal.GetParticipantBySeqId(request.ParticipantSequenceId);
            if (participant == null)
            {
                return response;
            }

            var deviceResponse = await deviceService.GetDeviceBySerialNumber(request.DeviceSerialNumber);
            var device = deviceResponse?.Device
                ?? throw new InvalidOperationException($"Device not found for serial number {request.DeviceSerialNumber}");

            device.StatusCode = (int)DeviceStatus.Abandoned;
            device.LocationCode = (int)DeviceLocation.Unknown;

            await deviceRecoveryService.RecoverDeviceAsync(device, participant, response);

            return response;
        }

        public async Task<Resource> ReplaceDevice(ReplaceDeviceRequest request)
        {
            var response = new Resource();
            var participant = await participantDal.GetParticipantBySeqId(request.ParticipantSequenceId);
            if (participant == null)
            {
                return response;
            }

            if (!participant.DeviceSeqID.HasValue)
            {
                response.AddMessage(MessageCode.ErrorCode, "ParticipantDeviceNotFound");
                return response;
            }

            var deviceSeqId = participant.DeviceSeqID.Value;

            var account = await accountDal.GetAccountByParticipantSeqId(participant.ParticipantSeqID);

            var homebaseDevice = (await labsMyScoreDeviceDal.GetDevicesBySeqIds(new[] { deviceSeqId }))?.FirstOrDefault();

            if (homebaseDevice == null || string.IsNullOrWhiteSpace(homebaseDevice.DeviceSerialNumber))
            {
                throw new InvalidOperationException($"Device not found for DeviceSeqID {deviceSeqId}");
            }

            var deviceResponse = await deviceService.GetDeviceBySerialNumber(homebaseDevice.DeviceSerialNumber);
            var device = deviceResponse?.Device
                ?? throw new InvalidOperationException($"Device not found for serial number {homebaseDevice.DeviceSerialNumber}");

            device.StatusCode = (int)DeviceStatus.Assigned;

            var vin = SelectVin(account, homebaseDevice, device);
            var make = Normalize(account?.Make);
            var modelName = Normalize(account?.Model);
            var year = NormalizeYear(account?.Year);

            var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            DeviceRecoveryResult recoveryResult = new(false);

            try
            {
                await deviceOrderDal.CreateReplacementOrder(new CreateReplacementDeviceOrderModel
                {
                    ParticipantGroupSeqId = participant.ParticipantGroupSeqID,
                    ParticipantSeqId = participant.ParticipantSeqID,
                    VehicleSeqId = participant.VehicleSeqID,
                    DeviceSeqId = participant.DeviceSeqID,
                    Vin = vin,
                    Make = make,
                    Model = modelName,
                    Year = year,
                });

                recoveryResult = await deviceRecoveryService.RecoverDeviceAsync(device, participant, response, (int)DeviceReturnReasonCode.DeviceReplaced);

                if (recoveryResult.Success)
                {
                    scope.Complete();
                }
            }
            finally
            {
                scope.Dispose();
            }

            if (!recoveryResult.Success)
            {
                return response;
            }

            if (response.Messages == null || !response.Messages.ContainsKey(MessageCode.ErrorCode))
            {
                response.AddMessage(MessageCode.StatusDescription, "Device replacement initiated");
            }

            return response;
        }

        public async Task<Resource> PingDevice(BusinessPingDeviceRequest request)
        {
            var response = new Resource();
            var result = await deviceService.PingDevice(request.DeviceSerialNumber);
            if (result.ResponseStatus == WcfXirgoService.ResponseStatus.Failure)
            {
                response.AddMessage(MessageCode.Error, "Ping Device Failed");
                return response;
            }
        
            response.AddMessage(MessageCode.StatusDescription, "Ping Sent to Device.  The device could take up to 72 hours to respond.");    
            return response;
        }

        public async Task<Resource> GetAudioStatusAWS(GetAudioStatusAWSRequest request)
        {
            var response = new Resource();
            if (request == null || string.IsNullOrWhiteSpace(request.DeviceSerialNumber))
            {
                response.AddMessage(MessageCode.ErrorCode, "GetAudioStatusInvalidRequest");
                response.AddMessage(MessageCode.Handled, true);
                return response;
            }

            // Check if device is IoT-enabled
            var featuresResponse = await deviceService.DeviceFeatures(request.DeviceSerialNumber);
            var isIoTDevice = featuresResponse?.Features?.Any(f => f.Code == TMXDeviceFeature.IOTDevice) ?? false;

            if (isIoTDevice)
            {
                // IoT device - use DeviceAPI (AWS)
                var audioStatus = await deviceApi.GetAudioStatus(request.DeviceSerialNumber);
                
                if (audioStatus == null)
                {
                    response.AddMessage(MessageCode.ErrorCode, "GetAudioStatusFailed");
                    response.AddMessage(MessageCode.ErrorDetails, "No response received from device API.");
                    return response;
                }

                var isAudioOn = audioStatus.Equals("On", StringComparison.OrdinalIgnoreCase);

                response.AddExtender(DeviceResourceExtenderKeys.AudioStatus, isAudioOn);
                response.AddMessage(
                    MessageCode.StatusDescription,
                    $"Device audio is currently {audioStatus}.");
            }
            else
            {
                // Non-IoT device - use Xirgo service
                var audioResponse = await deviceService.GetDeviceAudioBySerialNumber(request.DeviceSerialNumber);
                
                if (audioResponse == null)
                {
                    response.AddMessage(MessageCode.ErrorCode, "GetAudioStatusFailed");
                    response.AddMessage(MessageCode.ErrorDetails, "No response received from device service.");
                    return response;
                }

                if (audioResponse.ResponseStatus != WcfXirgoService.ResponseStatus.Success)
                {
                    response.AddMessage(MessageCode.ErrorCode, "GetAudioStatusFailed");
                    var detail = JoinErrorMessages(audioResponse.ResponseErrors?.Select(error => error?.Message));
                    if (!string.IsNullOrWhiteSpace(detail))
                    {
                        response.AddMessage(MessageCode.ErrorDetails, detail!);
                    }
                    return response;
                }

                var isAudioOn = audioResponse.IsAudioOn;
                response.AddExtender(DeviceResourceExtenderKeys.AudioStatus, isAudioOn);
                response.AddMessage(
                    MessageCode.StatusDescription,
                    $"Device audio is currently {(isAudioOn ? "On" : "Off")}.");
            }

            return response;
        }

        public async Task<Resource> SetAudioStatusAWS(SetAudioStatusAWSRequest request)
        {
            var response = new Resource();
            if (request == null || string.IsNullOrWhiteSpace(request.DeviceSerialNumber))
            {
                response.AddMessage(MessageCode.ErrorCode, "SetAudioStatusInvalidRequest");
                response.AddMessage(MessageCode.Handled, true);
                return response;
            }

            // Check if device is IoT-enabled
            var featuresResponse = await deviceService.DeviceFeatures(request.DeviceSerialNumber);
            var isIoTDevice = featuresResponse?.Features?.Any(f => f.Code == TMXDeviceFeature.IOTDevice) ?? false;

            if (isIoTDevice)
            {
                // IoT device - use DeviceAPI (AWS)
                var success = await deviceApi.SetAudioStatus(request.DeviceSerialNumber, request.IsAudioOn);
                
                if (!success)
                {
                    response.AddMessage(MessageCode.ErrorCode, "SetAudioStatusFailed");
                    response.AddMessage(MessageCode.ErrorDetails, "Failed to update device audio status in the cloud.");
                    return response;
                }

                response.AddExtender(DeviceResourceExtenderKeys.AudioStatus, request.IsAudioOn);
                response.AddMessage(
                    MessageCode.StatusDescription,
                    $"Device audio set to {(request.IsAudioOn ? "On" : "Off")}.");
            }
            else
            {
                // Non-IoT device - use Xirgo service
                var updateResponse = await deviceService.UpdateDeviceAudio(request.DeviceSerialNumber, request.IsAudioOn);
                
                if (updateResponse == null)
                {
                    response.AddMessage(MessageCode.ErrorCode, "SetAudioStatusFailed");
                    response.AddMessage(MessageCode.ErrorDetails, "No response received from device service.");
                    return response;
                }

                if (updateResponse.ResponseStatus != WcfXirgoService.ResponseStatus.Success)
                {
                    response.AddMessage(MessageCode.ErrorCode, "SetAudioStatusFailed");
                    var detail = JoinErrorMessages(updateResponse.ResponseErrors?.Select(error => error?.Message));
                    if (!string.IsNullOrWhiteSpace(detail))
                    {
                        response.AddMessage(MessageCode.ErrorDetails, detail!);
                    }
                    return response;
                }

                response.AddExtender(DeviceResourceExtenderKeys.AudioStatus, request.IsAudioOn);
                response.AddMessage(
                    MessageCode.StatusDescription,
                    $"Device audio set to {(request.IsAudioOn ? "On" : "Off")}.");
            }

            return response;
        }

        public async Task<Resource> UpdateAudio(UpdateAudioRequest request)
        {
            var response = new Resource();
            if (request == null || string.IsNullOrWhiteSpace(request.DeviceSerialNumber))
            {
                response.AddMessage(MessageCode.ErrorCode, "UpdateAudioInvalidRequest");
                response.AddMessage(MessageCode.Handled, true);
                return response;
            }
            var description = request.IsAudioOn ? "Audio Turned On" : "Audio Turned Off";

            var homebaseDevices = await labsMyScoreDeviceDal.GetDevicesBySerialNumbers(new[] { request.DeviceSerialNumber });
            var device = homebaseDevices?.FirstOrDefault();
            if (device == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "DeviceNotFound");
                return response;
            }

            var deviceSeqId = device.DeviceSeqID;
            if (deviceSeqId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "DeviceNotFound");
                return response;
            }

            var featuresResponse = await deviceService.DeviceFeatures(request.DeviceSerialNumber);
            var isIoTDevice = featuresResponse?.Features?.Any(f => f.Code == TMXDeviceFeature.IOTDevice) ?? false;

            if (isIoTDevice)
            {
                // IoT device - use DeviceAPI (AWS)
                var success = await deviceApi.SetAudioStatus(request.DeviceSerialNumber, request.IsAudioOn);
                
                if (!success)
                {
                    response.AddMessage(MessageCode.ErrorCode, "UpdateAudioFailed");
                    response.AddMessage(MessageCode.ErrorDetails, "Failed to update device audio status in the cloud.");
                    return response;
                }
            }
            else
            {
                // Non-IoT device - use Xirgo service
                var updateResponse = await deviceService.UpdateDeviceAudio(request.DeviceSerialNumber, request.IsAudioOn);
                if (updateResponse == null)
                {
                    response.AddMessage(MessageCode.ErrorCode, "UpdateAudioFailed");
                    response.AddMessage(MessageCode.ErrorDetails, "No response received from device service.");
                    return response;
                }

                if (updateResponse.ResponseStatus != WcfXirgoService.ResponseStatus.Success)
                {
                    response.AddMessage(MessageCode.ErrorCode, "UpdateAudioFailed");
                    var detail = JoinErrorMessages(updateResponse.ResponseErrors?.Select(error => error?.Message));
                    if (!string.IsNullOrWhiteSpace(detail))
                    {
                        response.AddMessage(MessageCode.ErrorDetails, detail!);
                    }

                    return response;
                }
            }

            var addResponse = await deviceActivityService.AddDeviceActivity(deviceSeqId, description);
            if (addResponse == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "AddDeviceActivityFailed");
                return response;
            }

            if (addResponse.ResponseStatus != WcfDeviceActivityService.ResponseStatus.Success)
            {
                response.AddMessage(MessageCode.ErrorCode, "AddDeviceActivityFailed");
                var detail = JoinErrorMessages(addResponse.ResponseErrors?.Select(error => error?.Message));
                if (!string.IsNullOrWhiteSpace(detail))
                {
                    response.AddMessage(MessageCode.ErrorDetails, detail!);
                }

                return response;
            }

            response.AddExtender(DeviceResourceExtenderKeys.AudioStatus, request.IsAudioOn);
            response.AddMessage(
                MessageCode.StatusDescription,
                $"Device audio set to {(request.IsAudioOn ? "On" : "Off")}.");

            return response;
        }

        public async Task<Resource> ResetDevice(BusinessResetDeviceRequest request)
        {
            var response = new Resource();

            if (request == null || string.IsNullOrWhiteSpace(request.DeviceSerialNumber))
            {
                response.AddMessage(MessageCode.ErrorCode, "ResetDeviceInvalidRequest");
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

            var resetResponse = await deviceService.ResetDevice(request.DeviceSerialNumber);
            if (resetResponse == null || resetResponse.ResponseStatus != WcfXirgoService.ResponseStatus.Success)
            {
                response.AddMessage(MessageCode.ErrorCode, "ResetDeviceFailed");

                var errors = resetResponse?.ResponseErrors;
                if (errors != null && errors.Length > 0)
                {
                    var detail = string.Join(", ", errors.Select(e => e?.Message).Where(message => !string.IsNullOrWhiteSpace(message)));
                    if (!string.IsNullOrWhiteSpace(detail))
                    {
                        response.AddMessage(MessageCode.ErrorDetails, detail!);
                    }
                }

                return response;
            }

            response.AddMessage(MessageCode.StatusDescription, "Reset Device request submitted");

            return response;
        }

        private static string? SelectVin(AccountDataModel? account, HomebaseDeviceDataModel homebaseDevice, XirgoDevice device)
        {
            if (!string.IsNullOrWhiteSpace(account?.VIN))
            {
                return account.VIN;
            }

            if (!string.IsNullOrWhiteSpace(account?.ReportedVIN))
            {
                return account.ReportedVIN;
            }

            if (!string.IsNullOrWhiteSpace(homebaseDevice?.ReportedVIN))
            {
                return homebaseDevice.ReportedVIN;
            }

            if (!string.IsNullOrWhiteSpace(device?.ReportedVIN))
            {
                return device.ReportedVIN;
            }

            return null;
        }

        private static string? Normalize(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static string? JoinErrorMessages(IEnumerable<string?>? messages)
        {
            if (messages == null)
            {
                return null;
            }

            var parts = messages
                .Where(message => !string.IsNullOrWhiteSpace(message))
                .Select(message => message!.Trim())
                .ToArray();

            return parts.Length > 0 ? string.Join("; ", parts) : null;
        }

        private static short? NormalizeYear(int? year)
        {
            if (!year.HasValue)
            {
                return null;
            }

            if (year.Value <= 0 || year.Value > short.MaxValue)
            {
                return null;
            }

            return (short)year.Value;
        }

        public async Task<Resource> SwapDevice(SwapDeviceRequest request)
        {
            var response = new Resource();

            var requestValidationError = ValidateSwapRequest(request);
            if (requestValidationError is { } requestError)
            {
                AddHandledError(response, requestError.Code, requestError.Description);
                return response;
            }

            var safeRequest = request!;
            var participants = await LoadParticipantsForSwap(safeRequest, response);
            if (participants == null)
            {
                return response;
            }

            var accounts = await LoadAccountsForSwap(participants.ParticipantGroupSeqId, safeRequest, response);
            if (accounts == null)
            {
                return response;
            }

            await HydrateAccountDevices(accounts.Source, accounts.Destination);

            var eligibilityError = ValidateSwapEligibility(accounts.Source, safeRequest.SourceParticipantSequenceId, "source");
            if (eligibilityError is { } sourceError)
            {
                AddHandledError(response, sourceError.Code, sourceError.Description);
                return response;
            }

            eligibilityError = ValidateSwapEligibility(accounts.Destination, safeRequest.DestinationParticipantSequenceId, "destination");
            if (eligibilityError is { } destinationError)
            {
                AddHandledError(response, destinationError.Code, destinationError.Description);
                return response;
            }

            var sourceDeviceSeqId = accounts.Source.DeviceSeqID!.Value;
            var destinationDeviceSeqId = accounts.Destination.DeviceSeqID!.Value;
            var sourceVehicleSeqId = accounts.Source.VehicleSeqID!.Value;
            var destinationVehicleSeqId = accounts.Destination.VehicleSeqID!.Value;

            using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            await participantDal.SwapParticipantAssignments(
                safeRequest.SourceParticipantSequenceId,
                safeRequest.DestinationParticipantSequenceId,
                sourceDeviceSeqId,
                destinationDeviceSeqId,
                sourceVehicleSeqId,
                destinationVehicleSeqId,
                accounts.Source.Nickname,
                accounts.Destination.Nickname);

            scope.Complete();

            response.AddMessage(MessageCode.StatusDescription, "Swap Devices Successful");

            return response;
        }

        private static (string Code, string Description)? ValidateSwapRequest(SwapDeviceRequest? request)
        {
            if (request == null)
            {
                return ("SwapDeviceInvalidRequest", "Request payload is required.");
            }

            if (request.SourceParticipantSequenceId <= 0 || request.DestinationParticipantSequenceId <= 0)
            {
                return ("SwapDeviceInvalidParticipants", "Participant sequence IDs must be greater than zero.");
            }

            if (request.SourceParticipantSequenceId == request.DestinationParticipantSequenceId)
            {
                return ("SwapDeviceParticipantsMustDiffer", "Source and destination participants must be different.");
            }

            return null;
        }

        private async Task<SwapParticipants?> LoadParticipantsForSwap(SwapDeviceRequest request, Resource response)
        {
            var sourceParticipant = await participantDal.GetParticipantBySeqId(request.SourceParticipantSequenceId);
            if (sourceParticipant == null)
            {
                AddHandledError(response, "SwapDeviceSourceNotFound", $"Participant {request.SourceParticipantSequenceId} was not found.");
                return null;
            }

            var destinationParticipant = await participantDal.GetParticipantBySeqId(request.DestinationParticipantSequenceId);
            if (destinationParticipant == null)
            {
                AddHandledError(response, "SwapDeviceDestinationNotFound", $"Participant {request.DestinationParticipantSequenceId} was not found.");
                return null;
            }

            if (sourceParticipant.ParticipantGroupSeqID == 0 || destinationParticipant.ParticipantGroupSeqID == 0 ||
                sourceParticipant.ParticipantGroupSeqID != destinationParticipant.ParticipantGroupSeqID)
            {
                AddHandledError(response, "SwapDeviceDifferentPolicies", "Participants must belong to the same policy to swap devices.");
                return null;
            }

            return new SwapParticipants(sourceParticipant, destinationParticipant, sourceParticipant.ParticipantGroupSeqID);
        }

        private async Task<SwapAccounts?> LoadAccountsForSwap(int participantGroupSeqId, SwapDeviceRequest request, Resource response)
        {
            var accounts = await accountDal.GetAccountsByParticipantGroupSeqId(participantGroupSeqId);
            var accountList = accounts?
                .Where(a => a != null)
                .ToList() ?? new List<AccountDataModel>();

            var sourceAccount = accountList.FirstOrDefault(a => a.ParticipantSeqID == request.SourceParticipantSequenceId);
            var destinationAccount = accountList.FirstOrDefault(a => a.ParticipantSeqID == request.DestinationParticipantSequenceId);

            if (sourceAccount == null)
            {
                AddHandledError(response, "SwapDeviceSourceNotFound", $"Participant {request.SourceParticipantSequenceId} was not found.");
                return null;
            }

            if (destinationAccount == null)
            {
                AddHandledError(response, "SwapDeviceDestinationNotFound", $"Participant {request.DestinationParticipantSequenceId} was not found.");
                return null;
            }

            return new SwapAccounts(sourceAccount, destinationAccount);
        }

        private async Task HydrateAccountDevices(AccountDataModel sourceAccount, AccountDataModel destinationAccount)
        {
            var deviceSeqIds = new HashSet<int>();
            if (sourceAccount.DeviceSeqID.HasValue)
            {
                deviceSeqIds.Add(sourceAccount.DeviceSeqID.Value);
            }

            if (destinationAccount.DeviceSeqID.HasValue)
            {
                deviceSeqIds.Add(destinationAccount.DeviceSeqID.Value);
            }

            if (deviceSeqIds.Count == 0)
            {
                return;
            }

            var homebaseDevices = await labsMyScoreDeviceDal.GetDevicesBySeqIds(deviceSeqIds);
            var deviceMap = homebaseDevices?
                .Where(device => device != null)
                .ToDictionary(device => device.DeviceSeqID);

            if (deviceMap == null)
            {
                return;
            }

            if (sourceAccount.DeviceSeqID.HasValue && deviceMap.TryGetValue(sourceAccount.DeviceSeqID.Value, out var sourceDeviceDetail))
            {
                sourceAccount.DeviceStatusCode = sourceDeviceDetail.DeviceStatusCode;
                sourceAccount.DeviceSerialNumber = sourceDeviceDetail.DeviceSerialNumber;
                sourceAccount.DeviceLocationCode = sourceDeviceDetail.DeviceLocationCode;
            }

            if (destinationAccount.DeviceSeqID.HasValue && deviceMap.TryGetValue(destinationAccount.DeviceSeqID.Value, out var destinationDeviceDetail))
            {
                destinationAccount.DeviceStatusCode = destinationDeviceDetail.DeviceStatusCode;
                destinationAccount.DeviceSerialNumber = destinationDeviceDetail.DeviceSerialNumber;
                destinationAccount.DeviceLocationCode = destinationDeviceDetail.DeviceLocationCode;
            }
        }

        private static void AddHandledError(Resource resource, string code, string description)
        {
            resource.AddMessage(MessageCode.ErrorCode, code);
            resource.AddMessage(MessageCode.ErrorDetails, description);
            resource.AddMessage(MessageCode.Handled, true);
        }

        private sealed record SwapParticipants(ParticipantInfo Source, ParticipantInfo Destination, int ParticipantGroupSeqId);

        private sealed record SwapAccounts(AccountDataModel Source, AccountDataModel Destination);

        private static (string Code, string Description)? ValidateSwapEligibility(AccountDataModel account, int participantSeqId, string qualifier)
        {
            if (account.ParticipantStatusCode != ENROLLED_STATUS_CODE)
            {
                return ("SwapDeviceParticipantNotEnrolled", $"The {qualifier} participant {participantSeqId} is not enrolled.");
            }

            if (account.DeviceExperienceTypeCode != (int)DeviceExperience.Device)
            {
                return ("SwapDeviceParticipantNotPlugIn", $"The {qualifier} participant {participantSeqId} does not have a plug-in device.");
            }

            if (!account.DeviceSeqID.HasValue)
            {
                return ("SwapDeviceParticipantMissingDevice", $"The {qualifier} participant {participantSeqId} does not have an assigned device.");
            }

            if (account.DeviceStatusCode != (int)DeviceStatus.Assigned)
            {
                return ("SwapDeviceParticipantNotAssigned", $"The {qualifier} participant {participantSeqId} does not have an assigned device status.");
            }

            if (!account.VehicleSeqID.HasValue)
            {
                return ("SwapDeviceParticipantMissingVehicle", $"The {qualifier} participant {participantSeqId} does not have an assigned vehicle.");
            }

            if (account.DeviceReceivedDateTime.HasValue)
            {
                return ("SwapDeviceParticipantDeviceReturned", $"The {qualifier} participant {participantSeqId} has a device marked as returned.");
            }

            if (account.DeviceAbandonedDateTime.HasValue)
            {
                return ("SwapDeviceParticipantDeviceAbandoned", $"The {qualifier} participant {participantSeqId} has a device marked as abandoned.");
            }

            return null;
        }
}
}
