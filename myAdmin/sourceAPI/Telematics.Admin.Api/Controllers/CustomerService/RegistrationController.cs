using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class RegistrationController : CustomerServiceController<IRegistrationOrchestrator>
    {
        [HttpGet]
        [ProducesResponseType(typeof(GetRegistrationResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(GetRegistrationResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetMobileParticipantRegistrationInfo(string telematicsId, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.GetRegistrations(new List<string> { telematicsId }, rolloutHelper);
            return response switch
            {
                GetRegistrationResponse.Success success => Ok(success.Registrations.First()),
                GetRegistrationResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPost]
        [ProducesResponseType(typeof(GetRegistrationResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(GetRegistrationResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetMobileParticipantRegistrationInfo(GetMobileParticipantRegistrationInfoRequest request, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.GetRegistrations(request.TelematicsIds, rolloutHelper);
			return response switch
            {
                GetRegistrationResponse.Success success => Ok(success.Registrations),
                GetRegistrationResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("ByPolicy/{policyNumber}")]
        [ProducesResponseType(typeof(GetRegistrationResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(GetRegistrationResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetPolicyRelatedRegistrationInfo([Required, StringLength(9)] string policyNumber, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.GetRegistrationsByPolicy(policyNumber, rolloutHelper);
			return response switch
            {
                GetRegistrationResponse.Success success => Ok(success.Registrations),
                GetRegistrationResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPost("Unlock")]
        [ProducesResponseType(typeof(UnlockRegistrationResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UnlockRegistrationResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> UnlockRegistration([Required] Registration registration, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.UnlockRegistration(registration, rolloutHelper);
            return response switch
            {
                UnlockRegistrationResponse.Success _ => Ok(),
                UnlockRegistrationResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPost("Unlock/DetermineStatus")]
        [ProducesResponseType(typeof(DetermineUnlockRegistrationStatusResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(DetermineUnlockRegistrationStatusResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> DetermineRegistrationStatusAfterUnlock(Participant participant, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.DetermineRegistrationStatusAfterUnlock(participant, rolloutHelper);
            return response switch
            {
                DetermineUnlockRegistrationStatusResponse.Success success => Ok(success.RegistrationStatus),
                DetermineUnlockRegistrationStatusResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPut("RegistrationCode")]
        [ProducesResponseType(typeof(UpdateRegistrationCodeResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UpdateRegistrationCodeResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> UpdateRegistrationCode(UpdateRegistrationCodeRequest request, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.UpdateRegistrationCode(request.PolicyNumber, request.NewRegistrationCode, request.Participant, request.ConflictingRegistrationSeqIds, rolloutHelper);
            return response switch
            {
                UpdateRegistrationCodeResponse.Success _ => Ok(),
                UpdateRegistrationCodeResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("RegistrationCode/{registrationCode}/Conflicts")]
        [ProducesResponseType(typeof(GetRegistrationConflictsResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(GetRegistrationConflictsResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetConflictingRegistrations([Required, StringLength(10, MinimumLength = 10)] string registrationCode)
        {
            var response = await Orchestrator.GetConflictingRegistrations(registrationCode);
            return response switch
            {
                GetRegistrationConflictsResponse.Success success => Ok(success.ConflictingRegistrations),
                GetRegistrationConflictsResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPut("RegistrationStatusCode")]
        [ProducesResponseType(typeof(UpdateRegistrationStatusCodeResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UpdateRegistrationStatusCodeResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> UpdateRegistrationStatus(MobileRegistrationStatusChangeRequest request)
        {
            var response = await Orchestrator.UpdateRegistrationStatusCode(request.PolicyNumber, request.RegistrationSeqId, request.UpdateAction, request.TelematicsId);
            return response switch
            {
                UpdateRegistrationStatusCodeResponse.Success success => Ok(success.NewRegistrationStatus),
                UpdateRegistrationStatusCodeResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPost("Unenroll")]
        [ProducesResponseType(typeof(UpdateRegistrationStatusCodeResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UpdateRegistrationStatusCodeResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> UnenrollARE(AreUnenrollRequest request)
        {
            var response = await Orchestrator.UnenrollARE(request.TelematicsId, request.UnenrollReason);
            return response switch
            {
                UnenrollResponse.Success success => Ok(),
                UnenrollResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }
    }
}
