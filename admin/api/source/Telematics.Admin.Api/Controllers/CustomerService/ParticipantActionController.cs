using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Shared;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class ParticipantActionController : CustomerServiceController<IParticipantActionsOrchestrator>
    {
        private readonly ILogger<ParticipantActionController> _logger;

		public ParticipantActionController(ILogger<ParticipantActionController> logger)
		{
			_logger = logger;
		}

		[HttpGet("scoreData/{participantSeqId}")]
        public async Task<ParticipantCalculatedValues> GetScoreData([Required] int participantSeqId)
        {
            return await Orchestrator.GetScoreData(participantSeqId);
        }

        [HttpGet("renewalScoreData/{participantSeqId}")]
        public async Task<IEnumerable<ParticipantCalculatedRenewalValues>> GetRenewalScoreData([Required] int participantSeqId)
        {
            return await Orchestrator.GetRenewalScoreData(participantSeqId);
        }

        [HttpPut("updateGuid")]
        public async Task UpdateParticipantGuid(UpdateGuidRequest request)
        {
            await Orchestrator.UpdateParticipantGuid(request.PolicyNumber, request.ParticipantSeqId, request.NewGuid);
        }

        [HttpPut("updateEnrollment")]
        public async Task UpdateEnrollmentDate(UpdateEnrollmentDateRequest request)
        {
            await Orchestrator.UpdateEnrollmentDate(request.PolicyNumber, request.ParticipantSeqId, request.NewEnrollmentDate);
        }

        [HttpPut("updateEnrollment20")]
        public async Task UpdateEnrollmentDate(UpdateEnrollmentDate20Request request)
        {
            await Orchestrator.UpdateEnrollmentDate20(request.PolicyNumber, request.ParticipantSeqId, request.NewEnrollmentDate, request.EndorsementAppliedDate, request.ShouldRecalculateScore);
        }

        [HttpGet("{participantId}/tripSummary/{participantSeqId}/{experience}/{algorithm}")]
        public async Task<TripSummary> GetTripSummary([Required] string participantId, [Required] int participantSeqId, [Required] DeviceExperience experience,
            [Required] AlgorithmType algorithm, DateTime? enrollmentDate = null)
        {
			_logger.LogWarning(LoggingEvents.ObseleteEndpoint, "Calling obselete AlgorithmType GetTripSummary Endpoint");
			return await Orchestrator.GetTripSummary(participantId, participantSeqId, experience, (int)algorithm, enrollmentDate);
        }

        [HttpGet("excludedDateRangeReasons")]
        public async Task<IEnumerable<ExcludedDateRangeReasonCode>> GetExcludedDateRangeReasonCodes()
        {
            return await Orchestrator.GetExcludedDateReasonCodes();
        }

        [HttpGet("excludedDateRange/{participantId}")]
        public async Task<IEnumerable<ExcludedDateRange>> GetExcludedDates([Required] string participantId)
        {
            return await Orchestrator.GetExcludedDates(participantId);
        }

        [HttpPut("excludedDateRange")]
        public async Task UpdateExcludedDate(ExcludedDateRangeRequest request)
        {
            await Orchestrator.UpdateExcludedDate(request.ParticipantId, request.StartDate, request.EndDate, request.ReasonCode, request.Description);
        }

        [HttpPost("excludedDateRange")]
        public async Task<ExcludedDateRange> AddExcludedDate(ExcludedDateRangeRequest request)
        {
            return await Orchestrator.AddExcludedDate(request.ParticipantId, request.StartDate, request.EndDate, request.ReasonCode, request.Description);
        }

        [HttpDelete("excludedDateRange")]
        public async Task DeleteExcludedDate(ExcludedDateRangeRequest request)
        {
            await Orchestrator.DeleteExcludedDate(request.ParticipantId, request.StartDate);
        }

        [HttpGet("optOutSuspension/{participantSeqId}")]
        public async Task<IEnumerable<OptOutSuspension>> GetOptOutSuspensions([Required] int participantSeqId)
        {
            return await Orchestrator.GetOptOutSuspensions(participantSeqId);
        }

        [HttpPost("optOutSuspension")]
        public async Task<int> AddOptOutSuspension(OptOutSuspensionRequest request)
        {
            return await Orchestrator.AddOptOutSuspension(request.ParticipantSeqId, request.DeviceSeqId, request.StartDate, request.EndDate, request.ReasonCode);
        }

        [HttpPut("optOutSuspension/cancel")]
        public void CancelOptOutSuspensions([Required] CancelOptOutRequest request)
        {
            Orchestrator.CancelOptOutSuspensions(request.optOutSeqIds);
        }

        [HttpGet("compatibilityActions")]
        public async Task<List<CompatibilityAction>> GetCompatibilityActions()
        {
            return await Orchestrator.GetCompatibilityActions();
        }

        [HttpGet("compatibilityActions/{experience}")]
        public async Task<List<CompatibilityAction>> GetCompatibilityActions(DeviceExperience experience)
        {
            return await Orchestrator.GetCompatibilityActions(experience);
        }

        [HttpGet("compatibilityTypes")]
        public async Task<List<CompatibilityType>> GetCompatibilityTypes()
        {
            return await Orchestrator.GetCompatibilityTypes();
        }

        [HttpGet("compatibilityTypes/{experience}")]
        public async Task<List<CompatibilityType>> GetCompatibilityTypes(DeviceExperience experience)
        {
            return await Orchestrator.GetCompatibilityTypes(experience);
        }

        [HttpPut("updateCompatibilityIssue")]
        public async Task<bool> UpdateCompatibilityIssue(CompatibilityItem compatibilityItem)
        {
            return await Orchestrator.UpdateCompatibilityItem(compatibilityItem);
        }

        [HttpPost("addCompatibilityIssue")]
        public async Task<bool> AddCompatabilityIssue(CompatibilityItem compatibilityItem)
        {
            return await Orchestrator.AddCompatibilityItem(compatibilityItem);
        }

        [HttpPost("merge")]
        public async Task MergeParticipants(ParticipantMergeRequest request)
        {
            await Orchestrator.MergeParticipant(request.PolicyNumber, request.PolicySuffix, request.SrcParticipantId, request.DestParticipantId);
        }

        [HttpGet("initialParticipationScoreInProcess/{participantSeqId}")]
        public async Task<InitialParticipantScoreInProcess> GetInitialScoreInProcess([Required] int participantSeqId)
        {
            return await Orchestrator.GetInitialScoreInProcess(participantSeqId);
        }
    }
}
