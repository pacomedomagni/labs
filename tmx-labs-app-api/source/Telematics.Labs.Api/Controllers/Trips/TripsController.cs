using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Progressive.Telematics.Labs.Business.Orchestrators.Trips;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.Trips
{
    [ApiController]
    [Route("Api/Trips")]
    [Produces("application/json")]
    public class TripsController : TelematicsController<ITripsOrchestrator>
    {
        [HttpGet("GetWeekdayTripSummary")]
        public async Task<List<DayOfWeekTripSummary>> GetWeekdayTripSummary(int participantSeqId, DateTime? startDate, DateTime? endDate)
        {
            return await Orchestrator.GetWeekDayTripSummary(participantSeqId);
        }

        [HttpGet("GetTripsByParticipant")]
        public async Task<TripSummaryResponse> GetTripsByParticipant(int participantSeqId, DateTime? startDate, DateTime? endDate)
        {
            return await Orchestrator.GetTripsByParticipant(participantSeqId, startDate, endDate);
        }

        [HttpGet("GetTripDetails")]
        public async Task<TripDetail[]> GetTripDetails(int tripSeqID, TripSpeedDistanceUnit unit)
        {
            return await Orchestrator.GetTripDetails(tripSeqID, unit);
        }

        [HttpGet("GetTripDetailsGPS")]
        public async Task<TripDetailsGPSResponse> GetTripDetailsGPS(int tripSeqId)
        {
            return await Orchestrator.GetTripDetailsGPS(tripSeqId);
        }
    }
}
