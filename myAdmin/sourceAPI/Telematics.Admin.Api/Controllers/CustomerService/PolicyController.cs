using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Policy;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class PolicyController : CustomerServiceController<IPolicyOrchestrator>
    {
        [HttpGet("{policyNumber}")]
        [HttpGet("Search/ByPolicy/{policyNumber}")]
        [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(GetPolicyResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetPolicy(
            [Required, StringLength(9)] string policyNumber,
            short? policySuffix = null,
            short? expirationYear = null,
            [FromServices] IRolloutHelper rolloutHelper = null
        )
        {
            var response = await Orchestrator.GetPolicy(policyNumber, rolloutHelper, policySuffix, expirationYear);
            return response switch
            {
                GetPolicyResponse.Success success => Ok(success.Policy),
                GetPolicyResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("Search/ByRegistration/{registrationCode}")]
        [ProducesResponseType(
            typeof(GetPolicyByRegistrationCodeResponse.Success),
            (int)HttpStatusCode.OK
        )]
        [ProducesResponseType(
            typeof(GetPolicyByRegistrationCodeResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetPolicyByRegistrationCodeResponse(
            [Required, StringLength(10, MinimumLength = 10)] string registrationCode,
            [FromServices] IRolloutHelper rolloutHelper
        )
        {
            var response = await Orchestrator.GetPolicyByRegistrationCode(registrationCode, rolloutHelper);
            return response switch
            {
                GetPolicyByRegistrationCodeResponse.Success success => Ok(success.Policies),
                GetPolicyByRegistrationCodeResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("Search/ByPluginDevice/{serialNumber}")]
        [ProducesResponseType(
            typeof(GetPolicyByDeviceSerialNumberResponse.Success),
            (int)HttpStatusCode.OK
        )]
        [ProducesResponseType(
            typeof(GetPolicyByDeviceSerialNumberResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetPolicyByDeviceSerialNumber(
            [Required] string serialNumber
        )
        {
            var response = await Orchestrator.GetPolicyByDeviceSerialNumber(serialNumber);
            return response switch
            {
                GetPolicyByDeviceSerialNumberResponse.Success success => Ok(success.Policy),
                GetPolicyByDeviceSerialNumberResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("Search/ByMobileIdentifier/{mobileId}")]
        [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(GetPolicyResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetPolicyByMobileIdentifier([Required] Guid mobileId, [FromServices] IRolloutHelper rolloutHelper)
        {
            var response = await Orchestrator.GetPolicyByMobileIdentifier(mobileId, rolloutHelper);
            return response switch
            {
                GetPolicyResponse.Success success => Ok(success.Policy),
                GetPolicyResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPut("MailingAddress")]
        [ProducesResponseType(typeof(UpdateMailingAddressResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(UpdateMailingAddressResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> UpdatePolicyMailingAddress(
            UpdateMailingAddressRequest request
        )
        {
            var response = await Orchestrator.UpdateMailingAddress(
                request.PolicyNumber,
                request.ContactName,
                request.Address1,
                request.Address2,
                request.City,
                request.State,
                request.ZipCode
            );
            return response switch
            {
                UpdateMailingAddressResponse.Success _ => Ok(),
                UpdateMailingAddressResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPut("AppAssignment")]
        [ProducesResponseType(typeof(UpdateAppAssignmentResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(UpdateAppAssignmentResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> UpdateAppAssignment(UpdateAppAssignmentRequest request)
        {
            var response = await Orchestrator.UpdateAppAssignment(
                request.PolicyNumber,
                request.AppName
            );
            return response switch
            {
                UpdateAppAssignmentResponse.Success _ => Ok(),
                UpdateAppAssignmentResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("{policyNumber}/Participant/Transfer/Eligibility")]
        [ProducesResponseType(
            typeof(GetEligibleTransferParticipantsResponse.Success),
            (int)HttpStatusCode.OK
        )]
        [ProducesResponseType(
            typeof(GetEligibleTransferParticipantsResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetParticipantsEligibleForTransfer(
            [Required, StringLength(9)] string policyNumber,
            [Required, StringLength(9)] string newPolicyNumber
        )
        {
            var response = await Orchestrator.GetParticipantsEligibleForTransfer(
                policyNumber,
                newPolicyNumber
            );
            return response switch
            {
                GetEligibleTransferParticipantsResponse.Success success
                    => Ok(success.EligibleParticipants),
                GetEligibleTransferParticipantsResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpPut("{policyNumber}/Participant/Transfer")]
        [ProducesResponseType(typeof(TransferParticipantsResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(TransferParticipantsResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> TransferParticipants(TransferParticipantRequest request)
        {
            var response = await Orchestrator.TransferParticipants(
                request.OldPolicy,
                request.NewPolicy
            );
            return response switch
            {
                TransferParticipantsResponse.Success _ => Ok(),
                TransferParticipantsResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("{policyNumber}/Participant/{telematicsId}")]
        [ProducesResponseType(typeof(GetParticipantResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(GetParticipantResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetParticipant(
            [Required, StringLength(9)] string policyNumber,
            [Required] string telematicsId,
            [FromServices] IRolloutHelper rolloutHelper
        )
        {
            var response = await Orchestrator.GetParticipantByTelematicsId(
                policyNumber,
                telematicsId,
                rolloutHelper
            );
            return response switch
            {
                GetParticipantResponse.Success success => Ok(success.Participant),
                GetParticipantResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("{policyNumber}/TMXSummaries")]
        [ProducesResponseType(typeof(GetHomebaseParticipantSummaryResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(GetHomebaseParticipantSummaryResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetParticipantTMXSummary(
            [Required] string policyNumber
        )
        {
            var participantsResponse = await Orchestrator.GetAllParticipantsHomebaseSummaryOnPolicy(
                policyNumber
            );

            List<string> telematicsIds = new List<string>();

            return participantsResponse switch
            {
                GetHomebaseParticipantSummaryResponse.Success success => Ok(success.Participants),
                GetHomebaseParticipantSummaryResponse.NotFound notfound => Ok(),
                GetHomebaseParticipantSummaryResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("{policyNumber}/Participant/SeqId/{participantSeqId}")]
        [ProducesResponseType(typeof(GetParticipantResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(
            typeof(GetParticipantResponse.Failure),
            (int)HttpStatusCode.InternalServerError
        )]
        public async Task<IActionResult> GetParticipantByParticipantSeqId(
            [Required, StringLength(9)] string policyNumber,
            [Required] int participantSeqId,
            [FromServices] IRolloutHelper rolloutHelper
		)
        {
            var response = await Orchestrator.GetParticipantBySeqId(policyNumber, participantSeqId, rolloutHelper);
            return response switch
            {
                GetParticipantResponse.Success success => Ok(success.Participant),
                GetParticipantResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        [HttpGet("{policyNumber}/TransactionAlert")]
        [ProducesResponseType(
     typeof(GetTransactionAlertResponse.Success),
     (int)HttpStatusCode.OK
 )]
        public async Task<IActionResult> GetTransactionAlert(
     [Required, StringLength(9)] string policyNumber
 )
        {
            var response = await Orchestrator.GetTransactionAlert(
                policyNumber
            );
            return response switch
            {
                GetTransactionAlertResponse.Success success
                    => Ok(success.Alert),
                GetTransactionAlertResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }
    }
}
