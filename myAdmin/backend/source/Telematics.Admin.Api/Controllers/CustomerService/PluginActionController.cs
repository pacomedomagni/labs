using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class PluginActionController : CustomerServiceController<IPluginActionsOrchestrator>
    {
        [HttpPut("updateAudio")]
        public async Task UpdateAudio(UpdateDeviceAudioRequest request)
        {
            await Orchestrator.UpdateDeviceAudio(request.DeviceSerialNumber, request.IsAudioEnabled);
        }

        [HttpPost("activateDevice")]
        public async Task ActivateDevice(ActivateDeviceRequest request)
        {
            await Orchestrator.ActivateDevice(request.PolicyNumber, request.DeviceSerialNumber);
        }

        [HttpGet("connectionTimeline")]
        public async Task<ConnectionTimeline> GetConnectionTimeline(
            [Required, StringLength(9)] string policyNumber,
            [Required] int participantSeqId,
            [Required] string vin,
            [Required] ProgramType programType,
            string slot = "")
        {
            return await Orchestrator.GetConnectionTimeline(policyNumber, participantSeqId, vin, programType);
        }

        [HttpPost("pingDevice/{deviceSerialNumber}")]
        public async Task PingDevice([Required] string deviceSerialNumber)
        {
            await Orchestrator.PingDevice(deviceSerialNumber);
        }

        [HttpGet("deviceInfo/{deviceSerialNumber}")]
        public async Task<PluginDevice> GetDeviceInformation([Required] string deviceSerialNumber, bool includeDetailedInfo = false, int? participantSeqId = null)
        {
            return await Orchestrator.DeviceInformation(deviceSerialNumber, includeDetailedInfo, participantSeqId);
        }

        [HttpPost("resetDevice/{deviceSerialNumber}")]
        public async Task ResetDevice([Required] string deviceSerialNumber)
        {
            await Orchestrator.ResetDevice(deviceSerialNumber);
        }

        [HttpPost("markDefective")]
        public async Task MarkDefective(MarkDeviceDefectiveRequest request)
        {
            await Orchestrator.MarkDeviceDefective(request.PolicyNumber, request.DeviceSerialNumber);
        }

        [HttpPost("replaceDevice")]
        public async Task ReplaceDevice(ReplaceDeviceRequest request)
        {
            await Orchestrator.ReplaceDevice(request.PolicyNumber, request.ParticipantSeqId);
        }

        [HttpPost("cancelReplaceDevice")]
        public async Task CancelDeviceReplacement(CancelDeviceReplacementRequest request)
        {
            await Orchestrator.CancelDeviceReplacement(request.PolicyNumber, request.ParticipantSeqId);
        }

        [HttpPost("swapDevice")]
        public async Task SwapDevice(SwapDeviceRequest request)
        {
            await Orchestrator.SwapDevice(request.PolicyNumber, request.SourceParticipantSeqId, request.DestParticipantSeqId);
        }

        [HttpPost("abandonDevice")]
        public async Task AbandonDevice(AbandonDeviceRequest request)
        {
            await Orchestrator.MarkDeviceAbandoned(request.PolicyNumber, request.ParticipantSeqId, request.DeviceSerialNumber, request.PolicySuffix, request.ExpirationYear);
        }

        [HttpPost("stopShipment")]
        public async Task StopDeviceShipment(StopDeviceShipmentRequest request)
        {
            await Orchestrator.StopDeviceShipment(request.PolicyNumber, request.ParticipantSeqId, request.PolicyPeriodSeqId, request.StopShipmentMethod);
        }

        [HttpGet("deviceLocationData/{deviceSerialNumber}")]
        public async Task<IEnumerable<DeviceLocationInfo>> GetDeviceLocationData([Required] string deviceSerialNumber, [Required] DateTime lastContactDate)
        {
            return await Orchestrator.DeviceLocation(deviceSerialNumber, lastContactDate);
        }

        [HttpGet("deviceHistory")]
        public async Task<DeviceHistory> GetDeviceHistory(int? participantSeqId = null, string serialNumber = "")
        {
            return await Orchestrator.GetDeviceHistory(participantSeqId, serialNumber);
        }

        [HttpPut("updateSuspensions")]
        public async Task UpdateSuspensions(UpdateDeviceSuspensionsRequest request)
        {
            await Orchestrator.UpdateSuspensionInfo(request.DeviceSeqId);
        }

        [HttpGet("initialDiscount")]
        public async Task<ParticipantCalculatedInitialValues> GetInitialInfo([Required] int participantSeqId)
        {
            return await Orchestrator.GetInitialParticipationInfo(participantSeqId);
        }

        [HttpPost("initialDiscount")]
        public async Task AddInitialDiscountRecord(AddInitialParticipantDiscountRecordRequest request)
        {
            await Orchestrator.AddInitialParticipantDiscountRecord(request.PolicyNumber, request.ParticipantSeqId);
        }

        [HttpGet("getAudioStatusAWS")]
        public async Task<string> GetAudioStatus([Required] string deviceSerialNumber)
        {
            return await Orchestrator.GetAudioStatus(deviceSerialNumber);
        }

        [HttpPatch("setAudioStatusAWS")]
        public async Task SetAudioStatus([Required] bool isAudioOn, [Required] string deviceSerialNumber)
        {
            await Orchestrator.SetAudioStatus(isAudioOn, deviceSerialNumber);
        }

        [HttpPost("feeReversal")]
        public async Task<WcfDevice.FeeReversalResponse> FeeReversal(FeeReversalRequest request)
        {
            return await Orchestrator.FeeReversal(request.DeviceSerialNumber, request.ExpirationYear, request.ParticipantSeqID, request.PolicyNumber, request.PolicySuffix);

        }

        [HttpPost("mobileReEnroll")]
        public async Task MobileReEnroll(MobileReEnrollRequest request)
        {
            await Orchestrator.MobileReEnroll(request.PolicyNumber, request.ParticipantId, request.MobileId);
        }

        [HttpPost("updateAdminStatusToActive")]
        public async Task UpdateAdminStatusToActive(UpdateAdminStatusRequest request)
        {
            await Orchestrator.UpdateAdminStatusToActive(request.PolicyNumber, request.ParticipantID, request.DeviceSerialNumber, HttpContext.User.Identity.Name);
        }

        [HttpPost("updateAdminStatusForOptOut")]
        public async Task UpdateAdminStatusForOptOut(UpdateAdminStatusRequest request)
        {
            await Orchestrator.UpdateAdminStatusForOptOut(request.PolicyNumber, request.ParticipantID, HttpContext.User.Identity.Name);
        }

        [HttpGet("getUspsShipTrackingNumber/{deviceSerialNumber}")]
        public async Task<string> GetUspsShipTrackingNumber([Required] string deviceSerialNumber)
        {
            return await Orchestrator.GetUspsShipTrackingNumber(deviceSerialNumber);
        }
    }
}
