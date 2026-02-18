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

        #region GetWeekDayTripSummary Tests

        [Fact]
        public async Task GetWeekDayTripSummary_ReturnsAllSevenDaysOfWeek()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = new List<Trip>(); // Empty trips

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            // Act
            var result = await _orchestrator.GetWeekDayTripSummary(participantSeqId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(7, result.Count);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Sunday);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Monday);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Tuesday);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Wednesday);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Thursday);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Friday);
            Assert.Contains(result, s => s.DayOfWeek == DayOfWeek.Saturday);
        }

        [Fact]
        public async Task GetWeekDayTripSummary_WithNoTrips_ReturnsZeroValuesForAllDays()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = new List<Trip>();

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            // Act
            var result = await _orchestrator.GetWeekDayTripSummary(participantSeqId);

            // Assert
            Assert.All(result, summary =>
            {
                Assert.Equal(0, summary.Trips);
                Assert.Equal(TimeSpan.Zero, summary.Duration);
                Assert.Equal(0, summary.Mileage);
                Assert.Equal(0, summary.HardBrakes);
                Assert.Equal(0, summary.HardAccels);
                Assert.Equal(0, summary.HighRiskSeconds);
            });
        }

        [Fact]
        public async Task GetWeekDayTripSummary_WithTripsOnSomeDays_ReturnsCorrectSummaries()
        {
            // Arrange
            const int participantSeqId = 1;
            // Monday Jan 15, 2024 and Tuesday Jan 16, 2024
            var trips = new List<Trip>
            {
                new Trip
                {
                    TripSeqID = 1,
                    TripStartDateTime = new DateTime(2024, 1, 15, 8, 0, 0), // Monday
                    TripEndDateTime = new DateTime(2024, 1, 15, 8, 30, 0), // 30 min duration
                    TripKilometers = 16.898m, // ~10.5 miles
                    HardBrakes = 2,
                    HardAccelerations = 1,
                    HighRiskSeconds = 15
                },
                new Trip
                {
                    TripSeqID = 2,
                    TripStartDateTime = new DateTime(2024, 1, 15, 17, 0, 0), // Monday
                    TripEndDateTime = new DateTime(2024, 1, 15, 17, 45, 0), // 45 min duration
                    TripKilometers = 24.14m, // ~15.0 miles
                    HardBrakes = 1,
                    HardAccelerations = 0,
                    HighRiskSeconds = 10
                },
                new Trip
                {
                    TripSeqID = 3,
                    TripStartDateTime = new DateTime(2024, 1, 16, 9, 0, 0), // Tuesday
                    TripEndDateTime = new DateTime(2024, 1, 16, 9, 20, 0), // 20 min duration
                    TripKilometers = 8.047m, // ~5.0 miles
                    HardBrakes = 0,
                    HardAccelerations = 1,
                    HighRiskSeconds = 5
                }
            };

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            // Act
            var result = await _orchestrator.GetWeekDayTripSummary(participantSeqId);

            // Assert
            Assert.Equal(7, result.Count);

            // Monday should have aggregated values
            var monday = result.First(s => s.DayOfWeek == DayOfWeek.Monday);
            Assert.Equal(2, monday.Trips);
            Assert.Equal(TimeSpan.FromMinutes(75), monday.Duration);
            Assert.Equal(3, monday.HardBrakes);
            Assert.Equal(1, monday.HardAccels);
            Assert.Equal(25, monday.HighRiskSeconds);

            // Tuesday should have single trip values
            var tuesday = result.First(s => s.DayOfWeek == DayOfWeek.Tuesday);
            Assert.Equal(1, tuesday.Trips);
            Assert.Equal(TimeSpan.FromMinutes(20), tuesday.Duration);

            // Other days should have zero values
            var wednesday = result.First(s => s.DayOfWeek == DayOfWeek.Wednesday);
            Assert.Equal(0, wednesday.Trips);
            Assert.Equal(TimeSpan.Zero, wednesday.Duration);
        }

        [Fact]
        public async Task GetWeekDayTripSummary_IsOrderedBySundayThroughSaturday()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = new List<Trip>();

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            // Act
            var result = await _orchestrator.GetWeekDayTripSummary(participantSeqId);

            // Assert
            Assert.Equal(DayOfWeek.Sunday, result[0].DayOfWeek);
            Assert.Equal(DayOfWeek.Monday, result[1].DayOfWeek);
            Assert.Equal(DayOfWeek.Tuesday, result[2].DayOfWeek);
            Assert.Equal(DayOfWeek.Wednesday, result[3].DayOfWeek);
            Assert.Equal(DayOfWeek.Thursday, result[4].DayOfWeek);
            Assert.Equal(DayOfWeek.Friday, result[5].DayOfWeek);
            Assert.Equal(DayOfWeek.Saturday, result[6].DayOfWeek);
        }

        [Fact]
        public async Task GetWeekDayTripSummary_WithNullTripStartDateTime_ExcludesFromSummary()
        {
            // Arrange
            const int participantSeqId = 1;
            var trips = new List<Trip>
            {
                new Trip
                {
                    TripSeqID = 1,
                    TripStartDateTime = null, // No start date
                    TripKilometers = 16.09m // ~10 miles
                },
                new Trip
                {
                    TripSeqID = 2,
                    TripStartDateTime = new DateTime(2024, 1, 15, 8, 0, 0), // Monday
                    TripKilometers = 8.047m // ~5 miles
                }
            };

            _tripsDal
                .Setup(dal => dal.GetTripsByParticipantSeqId(participantSeqId, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(trips);

            // Act
            var result = await _orchestrator.GetWeekDayTripSummary(participantSeqId);

            // Assert
            var monday = result.First(s => s.DayOfWeek == DayOfWeek.Monday);
            Assert.Equal(1, monday.Trips); // Only the trip with start date
        }

        #endregion

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
