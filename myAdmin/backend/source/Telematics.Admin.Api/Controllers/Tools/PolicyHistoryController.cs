using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels;
using Progressive.Telematics.Admin.Api.RequestModels.Tools.PolicyHistory;
using Progressive.Telematics.Admin.Business.Orchestrators.Tools;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.Controllers.Tools
{
    public class PolicyHistoryController : ToolsController<IPolicyHistoryOrchestrator>
    {
        [HttpGet("policy/{policyNumber}")]
        public async Task<SupportPolicy> GetPolicy([Required, StringLength(9)] string policyNumber)
        {
            return await Orchestrator.GetPolicyData(policyNumber);
        }

        [HttpGet("policy/{policyNumber}/participantJunction")]
        public async Task<IEnumerable<ParticipantJunction>> GetParticipantJunction([Required, StringLength(9)] string policyNumber)
        {
            return await Orchestrator.GetParticipantJunctionData(policyNumber);
        }

		[HttpGet("policy/{policyNumber}/participantJunction/csvfile")]
		public async Task<IActionResult> GetParticipantJunctionCsvFile([Required, StringLength(9)] string policyNumber)
		{
			var data = await Orchestrator.GetParticipantJunctionDataFile(policyNumber);
            return new FileStreamResult(data, "text/csv");
		}

		[HttpGet("policy/{policyNumber}/auditLogs")]
        public async Task<IEnumerable<TransactionAuditLog>> GetAuditLogs([Required, StringLength(9)] string policyNumber)
        {
            return await Orchestrator.GetAuditLogs(policyNumber);
        }

		[HttpGet("policy/{policyNumber}/auditLogs/csvfile")]
		public async Task<IActionResult> GetAuditLogsFile([Required, StringLength(9)] string policyNumber)
		{
			var data = await Orchestrator.GetAuditLogsFile(policyNumber);
			return new FileStreamResult(data, "text/csv");
		}

		[HttpGet("device/{serialNumber}")]
        public async Task<PluginDevice> GetDeviceInfo([Required] string serialNumber)
        {
            return await Orchestrator.GetDeviceInfo(serialNumber);
        }

        [HttpGet("device/mobile/{homebaseSeqId}")]
        public async Task<MobileDevice> GetMobileDeviceInfo([Required] int homebaseSeqId)
        {
            return await Orchestrator.GetMobileDeviceInfo(homebaseSeqId);
        }

        [HttpGet("participant/{seqId}/trip/regularity")]
        public async Task<int> GetTripRegularity([Required] int seqId)
        {
            return await Orchestrator.GetTripRegularity(seqId);
        }

        [HttpGet("participant/bySeqId/{seqId}/trip/summary")]
        public async Task<IEnumerable<TripSummaryDaily>> GetTripSummary([Required] int seqId)
        {
            return await Orchestrator.GetTripSummary(seqId);
        }

		[HttpGet("participant/bySeqId/{seqId}/trip/summary/csvfile")]
		public async Task<IActionResult> GetTripSummaryFile([Required] int seqId)
		{
			var data = await Orchestrator.GetTripSummaryFile(seqId);
			return new FileStreamResult(data, "text/csv");
		}

		[HttpGet("participant/byId/{id}/trip/summary")]
        public async Task<IEnumerable<TripSummaryDaily>> GetTripSummary([Required] string id)
        {
            return await Orchestrator.GetTripSummary(id);
        }

		[HttpGet("participant/byId/{id}/trip/summary/csvfile")]
		public async Task<IActionResult> GetTripSummaryFile([Required] string id)
		{
			var data = await Orchestrator.GetTripSummaryFile(id);
			return new FileStreamResult(data, "text/csv");
		}

		[HttpPost("trip/details")]
        public async Task<IEnumerable<TripEvent>> GetTripDetails(GetTripDetailsRequest request, [FromQuery] QueryParameters parms)
        {
            var data = await Orchestrator.GetTripDetails(request.TripSeqId, request.Date.LocalDateTime, request.Algorithm, request.Experience, parms.Page, parms.PageSize, parms.SortOrder, parms.Filter);
            AddPaginationHeader(data);
            return data;
        }

        [HttpPost("trip/details/csvfile")]
		public async Task<IActionResult> GetTripDetailsFile(GetTripDetailsRequest request, [FromQuery] QueryParameters parms)
		{
			var data = await Orchestrator.GetTripDetailsFile(request.TripSeqId, request.Date.LocalDateTime, request.Algorithm, request.Experience, parms.Page, parms.PageSize, parms.SortOrder, parms.Filter);
			return new FileStreamResult(data, "text/csv");
		}

		[HttpGet("participant/{seqId}/trip/events")]
        public async Task<IEnumerable<ParticipantDeviceTripEvent>> GetTripEvents([Required] int seqId)
        {
            return await Orchestrator.GetParticipantDeviceEvents(seqId);
        }

		[HttpGet("participant/{seqId}/trip/events/csvfile")]
		public async Task<IActionResult> GetTripEventsFile([Required] int seqId)
		{
			var data =  await Orchestrator.GetParticipantDeviceEventsFile(seqId);
			return new FileStreamResult(data, "text/csv");
		}
	}
}
