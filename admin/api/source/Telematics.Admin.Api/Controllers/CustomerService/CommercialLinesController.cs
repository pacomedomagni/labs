using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Cl;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Policy;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService;

public class CommercialLinesController : CustomerServiceController<ICommercialLinesOrchestrator>
{
    [HttpGet("Search/ByPolicy/{policyNumber}")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<CommercialPolicy> GetPolicy([Required] string policyNumber)
    {
        var policy = Orchestrator.GetPolicy(policyNumber).Result;
        if (policy == null)
        {
            return null;
        }

        policy.Participants = await Orchestrator.GetParticpants(policy.PolicySeqId);
        return policy;
    }

    [HttpGet("Search/ByDeviceSerialNumber/{serialNumber}")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<CommercialPolicy> GetPolicyByDeviceSerialNumber(
        [Required] string serialNumber
    )
    {
        return await Orchestrator.GetPolicyByDevice(serialNumber);
    }

    [HttpGet("getVehicleDetails/{vehicleSeqId}")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<VehicleUpdateDto> GetVehicleDetails([FromRoute] int vehicleSeqId)
    {
        return await Orchestrator.GetVehicleDetails(vehicleSeqId);
    }

    [HttpPost]
    [Route("removeOptOutRequest")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<bool> RemoveOptOut([FromBody] RemoveOptOutRequest request)
    {
        await Orchestrator.RemoveOptOut(request);
        return true;
    }

    [HttpPost]
    [Route("update")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<CommercialPolicy> Update([FromBody] CommercialPolicy request)
    {
        return await Orchestrator.Update(request);
    }

    [HttpPost]
    [Route("replaceDevice")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<RemoveOptOutResponse> ReplaceDevice([FromBody] RemoveOptOutRequest request)
    {
        return await Orchestrator.ReplaceDevice(request);
    }

    [HttpPost]
    [Route("optOutRequest/{ParticipantSeqID}")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<Boolean> OptOut([FromRoute] int participantSeqId)
    {
        return await Orchestrator.OptOut(participantSeqId);
    }

    [HttpPost("ParticipantHistory")]
    [ProducesResponseType(typeof(GetPolicyResponse.Success), (int)HttpStatusCode.OK)]
    [ProducesResponseType(
        typeof(GetPolicyResponse.Failure),
        (int)HttpStatusCode.InternalServerError
    )]
    public async Task<IAsyncEnumerable<CommercialTrips>> GetParticipantHistory([FromBody] int participantSeqId)
    {
        return await Orchestrator.GetParticipantHistory(participantSeqId);
    }

    [HttpGet("connectionTimeline")]
    public async Task<ConnectionTimeline> GetConnectionTimeline(
        [Required, StringLength(9)] string policyNumber,
        [Required] int participantSeqId,
        [Required] string vin
    )
    {
        return await Orchestrator.GetConnectionTimeline(policyNumber, participantSeqId, vin);
    }

    [HttpGet("excludedDateRange")]
    public async Task<IEnumerable<ExcludedDateRange>> GetExcludedDateRange(
        [Required] int participantSeqId
    )
    {
        return await Orchestrator.GetExcludedDateRange(participantSeqId);
    }

    [HttpPut("excludedDateRange")]
    public async Task UpdateExcludedDate(CommercialExcludedDateRangeRequest request)
    {
        await Orchestrator.UpdateExcludedDate(
            request.ParticipantSeqId,
            request.StartDate,
            request.EndDate,
            request.Description
        );
    }

    [HttpPost("excludedDateRange")]
    public async Task<Business.Resources.ExcludedDateRange> AddExcludedDate(
        CommercialExcludedDateRangeRequest request
    )
    {
        return await Orchestrator.AddExcludedDate(
            request.ParticipantSeqId,
            request.StartDate,
            request.EndDate,
            request.Description
        );
    }

    [HttpDelete("excludedDateRange")]
    public async Task DeleteExcludedDate(CommercialExcludedDateRangeRequest request)
    {
        await Orchestrator.DeleteExcludedDate(request.ParticipantSeqId, request.StartDate);
    }

    [HttpGet("getUspsShipTrackingNumber/{vehicleSeqId}")]
    public async Task<string> GetUspsShipTrackingNumber([Required] int vehicleSeqId)
    {
        return await Orchestrator.GetUspsShipTrackingNumber(vehicleSeqId);
    }
}
