using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Trips
{
    [SingletonService]
    public interface ITripsOrchestrator
    {
        Task<List<DayOfWeekTripSummary>> GetWeekDayTripSummary(int participantSeqId);
        Task<TripDetailsGPSResponse> GetTripDetailsGPS(int tripSeqId);
        Task<TripSummaryResponse> GetTripsByParticipant(int participantSeqId, DateTime? startDate, DateTime? endDate);

        Task<TripDetail[]> GetTripDetails(long tripSeqID, TripSpeedDistanceUnit unit);
    }

    public class TripsOrchestrator : ITripsOrchestrator
    {
        private readonly ILogger<TripsOrchestrator> _logger;
        private readonly ITripsDal _tripsDal;
        private readonly IExcludedTripsDal _excludedTripsDal;
        private readonly ITripDetailsDal _tripDetailsDAL;
        private readonly ITripDetailsGPSDAL _tripsDetailsGPSDal;
        private readonly ITripEventsDAL _tripEventsDal;

        public TripsOrchestrator(
            ILogger<TripsOrchestrator> logger,
            ITripsDal tripsDal,
            IExcludedTripsDal excludedTripsDal,
            ITripDetailsDal tripDetailsDAL,
            ITripDetailsGPSDAL tripDetailsGPSDal,
            ITripEventsDAL tripEventsDal)
        {
            _logger = logger;
            _tripsDal = tripsDal;
            _excludedTripsDal = excludedTripsDal;
            _tripDetailsDAL = tripDetailsDAL;
            _tripsDetailsGPSDal = tripDetailsGPSDal;
            _tripEventsDal = tripEventsDal;
        }

        public async Task<TripDetailsGPSResponse> GetTripDetailsGPS(int tripSeqId)
        {
            var response = new TripDetailsGPSResponse();
            var trips = await _tripsDetailsGPSDal.GetTripDetailsGPSByTripSeqId(tripSeqId);

            var tripEvents = await _tripEventsDal.GetTripEventsByTripSeqId(tripSeqId);

            foreach (var tripEvent in tripEvents)
            {
                if (tripEvent.LatitudeNbr != null && tripEvent.LongitudeNbr != null)
                {
                    response.TripEvents.Add(tripEvent);
                }
                else
                {
                    var nearestPoint = trips.FirstOrDefault(t => t.UtcDateTime.HasValue
                        && tripEvent.TripEventDateTime.HasValue
                        && t.UtcDateTime.Value.Truncate(TimeSpan.TicksPerSecond) == tripEvent.TripEventDateTime.Value.Truncate(TimeSpan.TicksPerSecond));

                    if (nearestPoint != null)
                    {
                        tripEvent.LatitudeNbr = nearestPoint.Latitude;
                        tripEvent.LongitudeNbr = nearestPoint.Longitude;
                        response.TripEvents.Add(tripEvent);
                    }
                }
            }

            if (trips != null)
            {
                response.TripDetails = trips.ToList();
            }

            return response;
        }

        public async Task<List<DayOfWeekTripSummary>> GetWeekDayTripSummary(int participantSeqId)
        {
            var trips = await GetFilteredTripsByParticipantSeqId(
                participantSeqId,
                DateTime.Today.AddYears(-30),
                DateTime.Now);

            var tripsByDay = trips
                .Where(t => t.TripStartDateTime.HasValue)
                .GroupBy(t => t.TripStartDateTime.Value.DayOfWeek)
                .ToDictionary(g => g.Key, g => g.ToList());

            var weekdaySummaries = Enum.GetValues<DayOfWeek>()
                .Select(day =>
                {
                    var dayTrips = tripsByDay.GetValueOrDefault(day, new List<Trip>());
                    return new DayOfWeekTripSummary()
                    {
                        DayOfWeek = day,
                        Trips = dayTrips.Count,
                        Duration = TimeSpan.FromTicks(dayTrips.Sum(t => t.TripDuration?.Ticks ?? 0)),
                        Mileage = dayTrips.Sum(t => t.TripMiles ?? 0),
                        HardBrakes = dayTrips.Sum(t => t.HardBrakes ?? 0),
                        HardAccels = dayTrips.Sum(t => t.HardAccelerations ?? 0),
                        HighRiskSeconds = dayTrips.Sum(t => t.HighRiskSeconds ?? 0)
                    };
                })
                .OrderBy(s => s.DayOfWeek) // Sunday (0) through Saturday (6)
                .ToList();

            return weekdaySummaries;
        }

        public async Task<TripSummaryResponse> GetTripsByParticipant(int participantSeqId, DateTime? startDate, DateTime? endDate)
        {
            var response = new TripSummaryResponse();
            var trips = await GetFilteredTripsByParticipantSeqId(participantSeqId, startDate, endDate);

            if (trips == null)
            {
                response.TripDays = new List<TripDaySummary>();
                return response;
            }


            var tripDays = trips
                .Where(t => t.TripStartDateTime.HasValue)
                .GroupBy(t => t.TripStartDateTime.Value.Date)
                .Select(g => new TripDaySummary
                {
                    TripDay = g.Key,
                    Trips = g.OrderBy(t => t.TripStartDateTime).ToList()
                })
                .OrderByDescending(td => td.TripDay)
                .ToList();

            response.TripDays = tripDays;

            return response;
        }

        /// <summary>
        /// Retrieves all trips filtered on existing date ranges
        /// </summary>
        /// <returns>List of Trips</returns>
        private async Task<IEnumerable<Trip>> GetFilteredTripsByParticipantSeqId(int participantSeqId, DateTime? startDate, DateTime? endDate)
        {
            var trips = await _tripsDal.GetTripsByParticipantSeqId(
                participantSeqId,
                startDate ?? DateTime.Today.AddYears(-30),
                endDate ?? DateTime.Now);

            if (trips == null)
            {
                return new List<Trip>();
            }

            // Filter out trips that fall within excluded date ranges
            var excludedDateRanges = await _excludedTripsDal.GetExcludedTripsByParticipantSeqId(participantSeqId);
            var filteredTrips = FilterExcludedTrips(trips, excludedDateRanges);
            return filteredTrips;
        }

        /// <summary>
        /// Filters out trips that fall within any of the excluded date ranges.
        /// A trip is excluded if its start date/time falls within an excluded range.
        /// </summary>
        /// <param name="trips">The list of trips to filter</param>
        /// <param name="excludedDateRanges">The excluded date ranges</param>
        /// <returns>Filtered list of trips excluding those in the excluded date ranges</returns>
        private IEnumerable<Trip> FilterExcludedTrips(IEnumerable<Trip> trips, IEnumerable<ExcludedDateRange> excludedDateRanges)
        {
            if (trips == null)
            {
                return new List<Trip>();
            }

            return trips.Where(trip =>
            {
                if (!trip.TripStartDateTime.HasValue)
                {
                    return true; // Keep trips without start date
                }

                // Check if trip falls within any excluded range
                return !excludedDateRanges.Any(excludedRange =>
                    trip.TripStartDateTime.Value >= excludedRange.RangeStart &&
                    trip.TripStartDateTime.Value <= excludedRange.RangeEnd);
            });
        }

        public async Task<TripDetail[]> GetTripDetails(long tripSeqID, TripSpeedDistanceUnit unit)
        {

            TripDetailsResponse response = new TripDetailsResponse();

            var result = await _tripDetailsDAL.GetTripDetails(tripSeqID, unit);
            var tripDetails = new List<TripDetail>();
            foreach (var row in result.GetDetails())
            {

                tripDetails.Add(row);
            }

            return tripDetails.ToArray();
        }
    }
}
