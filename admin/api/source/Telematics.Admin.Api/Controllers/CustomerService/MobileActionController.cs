using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using WcfParticipantService;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class MobileActionController : CustomerServiceController<IMobileActionsOrchestrator>
    {
        [HttpPost("switchToOBD")]
        public async Task<ActionResult<WcfParticipantService.SwitchMobileToOBDResponse>> SwitchMobileToOBD(WcfParticipantService.SwitchMobileToOBDRequest request)
        {
            var results = await Orchestrator.SwitchToOBD(request.PolicyNumber, request.ParticipantSeqId);
            if (results?.ResponseErrors?.Length == 0)
            {
                return Ok(results);
            }
            return BadRequest(results.ResponseErrors);

        }

        [HttpPost("swapDriver")]
        public async Task SwapDriver(SwapDriverRequest request)
        {
            await Orchestrator.SwapDriver(request.PolicyNumber, request.SrcParticipantSeqId, request.DestParticipantSeqId);
        }

        [HttpGet("getRegistrations/{groupExternalId}")]
        public async Task<IEnumerable<Registration>> GetMobileRegistrations(string groupExternalId)
        {
            return await Orchestrator.GetMobileRegistrationData(groupExternalId);
        }

        [HttpGet("returnMobileContexts")]
        public async Task<MobileContext[]> ReturnMobileContexts(int participantSeqId)
        {
            return await Orchestrator.ReturnMobileContexts(participantSeqId);
        }
    }
}
