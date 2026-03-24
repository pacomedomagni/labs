using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Device;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.Device
{
    [Route("Api/Device")]
    public class ParticipantController() : TelematicsController<IDeviceOrchestrator>
    {

        [HttpPost("MarkDefective")]
        public async Task<Resource> MarkDefective([FromBody] MarkDefectiveRequest request)
        {
            return await Orchestrator.MarkDefective(request);
        }

        [HttpPost("MarkAbandoned")]
        public async Task<Resource> MarkAbandoned([FromBody] MarkAbandonedRequest request)
        {
            return await Orchestrator.MarkAbandoned(request);
        }

        [HttpPost("ReplaceDevice")]
        public async Task<Resource> ReplaceDevice([FromBody] ReplaceDeviceRequest request)
        {
            return await Orchestrator.ReplaceDevice(request);
        }

        [HttpPost("SwapDevice")]
        public async Task<Resource> SwapDevice([FromBody] SwapDeviceRequest request)
        {
            return await Orchestrator.SwapDevice(request);
        }

        [HttpPost("PingDevice")]
        public async Task<Resource> PingDevice([FromBody] Progressive.Telematics.Labs.Business.Resources.Resources.Device.PingDeviceRequest request)
        {
            return await Orchestrator.PingDevice(request);
        }

        [HttpPost("ResetDevice")]
        public async Task<Resource> ResetDevice([FromBody] ResetDeviceRequest request)
        {
            return await Orchestrator.ResetDevice(request);
        }

        [HttpGet("GetAudioStatusAWS")]
        public async Task<Resource> GetAudioStatusAWS([FromQuery] string deviceSerialNumber)
        {
            return await Orchestrator.GetAudioStatusAWS(new Progressive.Telematics.Labs.Business.Resources.Resources.Device.GetAudioStatusAWSRequest { DeviceSerialNumber = deviceSerialNumber });
        }

        [HttpPatch("SetAudioStatusAWS")]
        public async Task<Resource> SetAudioStatusAWS([FromQuery] string deviceSerialNumber, [FromQuery] bool isAudioOn)
        {
            return await Orchestrator.SetAudioStatusAWS(new Progressive.Telematics.Labs.Business.Resources.Resources.Device.SetAudioStatusAWSRequest { DeviceSerialNumber = deviceSerialNumber, IsAudioOn = isAudioOn });
        }

        [HttpPut("UpdateAudio")]
        public async Task<Resource> UpdateAudio([FromBody] Progressive.Telematics.Labs.Business.Resources.Resources.Device.UpdateAudioRequest request)
        {
            return await Orchestrator.UpdateAudio(request);
        }

        [HttpPost("Activate")]
        public async Task<ActionResult<Resource>> Activate([FromBody] Progressive.Telematics.Labs.Business.Resources.Resources.Device.ActivateDeviceRequest request)
        {
            var result = await Orchestrator.ActivateDevice(request);

            // Any errors besides "not found" errors return BadRequest
            if (result.Messages.Any(t => t.Key == MessageCode.Error))
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpPost("Deactivate")]
        public async Task<Resource> Deactivate([FromBody] Progressive.Telematics.Labs.Business.Resources.Resources.Device.DeactivateDeviceRequest request)
        {
            return await Orchestrator.DeactivateDevice(request);
        }
    }
}
