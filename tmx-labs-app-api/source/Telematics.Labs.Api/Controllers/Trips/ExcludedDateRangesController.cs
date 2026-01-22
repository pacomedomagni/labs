using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Orchestrators.Trips;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

namespace Progressive.Telematics.Labs.Api.Controllers.Trips
{
    [ApiController]
    [Route("Api/ExcludedDateRanges")]
    [Produces("application/json")]
    public class ExcludedDateRangesController : TelematicsController<IExcludedDateRangeOrchestrator>
    {
        private readonly ILogger<ExcludedDateRangesController> _logger;

        public ExcludedDateRangesController(ILogger<ExcludedDateRangesController> logger)
        {
            _logger = logger;
        }

        [HttpGet("GetByParticipant")]
        public async Task<ActionResult<IEnumerable<ExcludedDateRange>>> GetByParticipant(int participantSeqId)
        {
            try
            {
                var result = await Orchestrator.GetByParticipantAsync(participantSeqId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid request for participant {ParticipantSeqId}", participantSeqId);
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Insert")]
        public async Task<ActionResult<ExcludedDateRange>> Insert([FromBody] ExcludedDateRangeCommand command)
        {
            try
            {
                var result = await Orchestrator.InsertAsync(command);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid excluded date range insert request for participant {ParticipantSeqId}", command?.ParticipantSeqId);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogInformation(ex, "Business rule violation while inserting excluded range for participant {ParticipantSeqId}", command?.ParticipantSeqId);
                return Conflict(ex.Message);
            }
        }

        [HttpPost("Update")]
        public async Task<ActionResult<ExcludedDateRange>> Update([FromBody] ExcludedDateRangeCommand command)
        {
            try
            {
                var result = await Orchestrator.UpdateAsync(command);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid excluded date range update request for participant {ParticipantSeqId}", command?.ParticipantSeqId);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogInformation(ex, "Business rule violation while updating excluded range for participant {ParticipantSeqId}", command?.ParticipantSeqId);
                return Conflict(ex.Message);
            }
        }

        [HttpPost("Delete")]
        public async Task<IActionResult> Delete([FromBody] ExcludedDateRangeDeleteCommand command)
        {
            try
            {
                await Orchestrator.DeleteAsync(command);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid excluded date range delete request for participant {ParticipantSeqId}", command?.ParticipantSeqId);
                return BadRequest(ex.Message);
            }
        }
    }
}
