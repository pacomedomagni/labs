using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.Controllers.v2.CustomerService
{
	public class ParticipantActionController : CustomerServiceControllerv2<IParticipantActionsOrchestrator>
    {

        [HttpGet("{participantId}/tripSummary/{participantSeqId}/{experience}/{algorithm}")]
        public async Task<TripSummary> GetTripSummary([Required] string participantId, [Required] int participantSeqId, [Required] DeviceExperience experience,
            [Required] int algorithm, DateTime? enrollmentDate = null)
        {
            return await Orchestrator.GetTripSummary(participantId, participantSeqId, experience, algorithm, enrollmentDate);
        }
    }
}
