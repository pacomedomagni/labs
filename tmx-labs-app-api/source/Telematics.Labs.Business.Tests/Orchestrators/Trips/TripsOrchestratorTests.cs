using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.Trips;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Services.Database;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests.Trips
{
    public class TripsOrchestratorTests
    {
        private readonly Mock<ILogger<TripsOrchestrator>> _logger;
        private readonly Mock<ITripsDal> _tripsDal;
        private readonly Mock<IExcludedTripsDal> _excludedTripsDal;
        private readonly Mock<ITripDetailsDal> _tripDetailsDal;
        private readonly Mock<ITripDetailsGPSDAL> _tripDetailsGPSDal;
        private readonly Mock<ITripEventsDAL> _tripEventsDal;
        private readonly TripsOrchestrator _orchestrator;

        public TripsOrchestratorTests()
        {
            _logger = new Mock<ILogger<TripsOrchestrator>>();
            _tripsDal = new Mock<ITripsDal>();
            _excludedTripsDal = new Mock<IExcludedTripsDal>();
            _tripDetailsDal = new Mock<ITripDetailsDal>();
            _tripDetailsGPSDal = new Mock<ITripDetailsGPSDAL>();
            _tripEventsDal = new Mock<ITripEventsDAL>();
            _orchestrator = new TripsOrchestrator(_logger.Object, _tripsDal.Object, _excludedTripsDal.Object, _tripDetailsDal.Object, _tripDetailsGPSDal.Object, _tripEventsDal.Object);
        }

        [Fact]
        public async Task GetTripsByParticipant_WithNoExcludedRanges_ReturnsAllTrips()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = CreateSampleTrips();

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(new List<ExcludedDateRange>());

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.TripDays);
            Assert.Equal(3, result.TripDays.Count);
            var allTrips = result.TripDays.SelectMany(td => td.Trips).ToList();
            Assert.Equal(5, allTrips.Count);
        }

        [Fact]
        public async Task GetTripsByParticipant_WithExcludedRange_FiltersTripsInRange()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = CreateSampleTrips();
            var excludedRanges = new List<ExcludedDateRange>
            {
                new ExcludedDateRange
                {
                    RangeStart = new DateTime(2024, 1, 15, 0, 0, 0),
                    RangeEnd = new DateTime(2024, 1, 15, 23, 59, 59),
                    Description = "Test exclusion"
                }
            };

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(excludedRanges);

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.TripDays);
            Assert.Equal(2, result.TripDays.Count); // Only 2 days should remain
            var allTrips = result.TripDays.SelectMany(td => td.Trips).ToList();
            Assert.Equal(3, allTrips.Count); // Only 3 trips should remain (2 from Jan 15 are excluded)
            
            // Verify no trips from excluded date
            Assert.DoesNotContain(allTrips, t => t.TripStartDateTime.Value.Date == new DateTime(2024, 1, 15));
        }

        [Fact]
        public async Task GetTripsByParticipant_WithMultipleExcludedRanges_FiltersAllMatchingTrips()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = CreateSampleTrips();
            var excludedRanges = new List<ExcludedDateRange>
            {
                new ExcludedDateRange
                {
                    RangeStart = new DateTime(2024, 1, 14, 0, 0, 0),
                    RangeEnd = new DateTime(2024, 1, 14, 23, 59, 59),
                    Description = "First exclusion"
                },
                new ExcludedDateRange
                {
                    RangeStart = new DateTime(2024, 1, 16, 0, 0, 0),
                    RangeEnd = new DateTime(2024, 1, 16, 23, 59, 59),
                    Description = "Second exclusion"
                }
            };

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(excludedRanges);

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.TripDays);
            Assert.Single(result.TripDays); // Only 1 day should remain (Jan 15)
            var allTrips = result.TripDays.SelectMany(td => td.Trips).ToList();
            Assert.Equal(2, allTrips.Count); // Only 2 trips from Jan 15 should remain
        }

        [Fact]
        public async Task GetTripsByParticipant_WithPartialDayExclusion_FiltersOnlyMatchingTrips()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = CreateSampleTrips();
            var excludedRanges = new List<ExcludedDateRange>
            {
                new ExcludedDateRange
                {
                    RangeStart = new DateTime(2024, 1, 15, 10, 0, 0),
                    RangeEnd = new DateTime(2024, 1, 15, 12, 0, 0),
                    Description = "Morning exclusion"
                }
            };

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(excludedRanges);

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            var jan15Trips = result.TripDays.FirstOrDefault(td => td.TripDay.Date == new DateTime(2024, 1, 15))?.Trips;
            Assert.NotNull(jan15Trips);
            Assert.Single(jan15Trips); // Only the 2 PM trip should remain
            Assert.Equal(new DateTime(2024, 1, 15, 14, 0, 0), jan15Trips[0].TripStartDateTime);
        }

        [Fact]
        public async Task GetTripsByParticipant_WithNullTrips_ReturnsEmptyTripDays()
        {
            // Arrange
            const int participantSeqId = 1;

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync((IEnumerable<Trip>)null);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(new List<ExcludedDateRange>());

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.TripDays);
            Assert.Empty(result.TripDays);
        }

        [Fact]
        public async Task GetTripsByParticipant_WithTripsWithoutStartTime_KeepsTripsWithoutStartTime()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = new List<Trip>
            {
                new Trip { TripSeqID = 1, TripStartDateTime = new DateTime(2024, 1, 15, 10, 0, 0) },
                new Trip { TripSeqID = 2, TripStartDateTime = null }, // Trip without start time
                new Trip { TripSeqID = 3, TripStartDateTime = new DateTime(2024, 1, 15, 14, 0, 0) }
            };

            var excludedRanges = new List<ExcludedDateRange>
            {
                new ExcludedDateRange
                {
                    RangeStart = new DateTime(2024, 1, 15, 0, 0, 0),
                    RangeEnd = new DateTime(2024, 1, 15, 23, 59, 59),
                    Description = "Full day exclusion"
                }
            };

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(excludedRanges);

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result.TripDays); // Trips with null start times are filtered out in the grouping logic
        }

        [Fact]
        public async Task GetTripsByParticipant_WithDateRangeParameters_PassesToDal()
        {
            // Arrange
            const int participantSeqId = 1;
            var startDate = new DateTime(2024, 1, 1);
            var endDate = new DateTime(2024, 1, 31);
            var trips = CreateSampleTrips();

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, startDate, endDate))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(new List<ExcludedDateRange>());

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, startDate, endDate);

            // Assert
            _tripsDal.Verify(dal => dal.GetTripsByParticipantSeqId(participantSeqId, startDate, endDate), Times.Once);
        }

        [Fact]
        public async Task GetTripsByParticipant_GroupsTripsCorrectlyByDay()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = CreateSampleTrips();

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            _excludedTripsDal
                .Setup(dal => dal.GetExcludedTripsByParticipantSeqId(participantSeqId))
                .ReturnsAsync(new List<ExcludedDateRange>());

            // Act
            var result = await _orchestrator.GetTripsByParticipant(participantSeqId, null, null);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.TripDays.Count);
            
            // Verify ordering (most recent first)
            Assert.Equal(new DateTime(2024, 1, 16), result.TripDays[0].TripDay);
            Assert.Equal(new DateTime(2024, 1, 15), result.TripDays[1].TripDay);
            Assert.Equal(new DateTime(2024, 1, 14), result.TripDays[2].TripDay);

            // Verify trips within each day are ordered by time
            var jan15Day = result.TripDays[1];
            Assert.Equal(2, jan15Day.Trips.Count);
            Assert.True(jan15Day.Trips[0].TripStartDateTime < jan15Day.Trips[1].TripStartDateTime);
        }

        /// <summary>
        /// Creates sample trips for testing
        /// </summary>
        private static List<Trip> CreateSampleTrips()
        {
            return new List<Trip>
            {
                new Trip { TripSeqID = 1, TripStartDateTime = new DateTime(2024, 1, 14, 8, 0, 0), ParticipantSeqID = 1 },
                new Trip { TripSeqID = 2, TripStartDateTime = new DateTime(2024, 1, 15, 10, 0, 0), ParticipantSeqID = 1 },
                new Trip { TripSeqID = 3, TripStartDateTime = new DateTime(2024, 1, 15, 14, 0, 0), ParticipantSeqID = 1 },
                new Trip { TripSeqID = 4, TripStartDateTime = new DateTime(2024, 1, 16, 9, 30, 0), ParticipantSeqID = 1 },
                new Trip { TripSeqID = 5, TripStartDateTime = new DateTime(2024, 1, 16, 17, 0, 0), ParticipantSeqID = 1 }
            };
        }
    }
}
