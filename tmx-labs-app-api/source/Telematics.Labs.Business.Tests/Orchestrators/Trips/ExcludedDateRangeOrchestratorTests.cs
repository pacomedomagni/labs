using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.Trips;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Services.Database;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests.Trips
{
    public class ExcludedDateRangeOrchestratorTests
    {
        private readonly Mock<IExcludedTripsDal> _excludedTripsDal = new();
        private readonly Mock<ILogger<ExcludedDateRangeOrchestrator>> _logger = new();
        private readonly ExcludedDateRangeOrchestrator _sut;

        public ExcludedDateRangeOrchestratorTests()
        {
            _sut = new ExcludedDateRangeOrchestrator(_logger.Object, _excludedTripsDal.Object);
        }

        [Fact]
        public async Task InsertAsync_WhenValid_InsertsAndReturnsRange()
        {
            var command = new ExcludedDateRangeCommand
            {
                ParticipantSeqId = 42,
                RangeStart = new DateTime(2024, 1, 1),
                RangeEnd = new DateTime(2024, 1, 10),
                Description = "Service visit",
            };

            var inserted = new ExcludedDateRange
            {
                ParticipantSeqId = command.ParticipantSeqId,
                RangeStart = command.RangeStart,
                RangeEnd = command.RangeEnd,
                Description = command.Description,
                CreateDate = DateTime.UtcNow,
            };

            _excludedTripsDal
                .Setup(dal => dal.InsertExcludedTripAsync(command.ParticipantSeqId, command.RangeStart, command.RangeEnd, command.Description))
                .ReturnsAsync(inserted);

            var result = await _sut.InsertAsync(command);

            Assert.Equal(inserted, result);
            _excludedTripsDal.Verify(dal => dal.InsertExcludedTripAsync(command.ParticipantSeqId, command.RangeStart, command.RangeEnd, command.Description), Times.Once);
        }

        [Fact]
        public async Task InsertAsync_WhenDatesInvalid_Throws()
        {
            var command = new ExcludedDateRangeCommand
            {
                ParticipantSeqId = 42,
                RangeStart = new DateTime(2024, 2, 1),
                RangeEnd = new DateTime(2024, 1, 1),
            };

            await Assert.ThrowsAsync<ArgumentException>(() => _sut.InsertAsync(command));
            _excludedTripsDal.Verify(dal => dal.InsertExcludedTripAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<string?>()), Times.Never);
        }

        [Fact]
        public async Task UpdateAsync_UsesOriginalRangeStartAndReturnsResult()
        {
            var existing = new ExcludedDateRange
            {
                ParticipantSeqId = 42,
                RangeStart = new DateTime(2024, 1, 1),
                RangeEnd = new DateTime(2024, 1, 10),
            };

            var command = new ExcludedDateRangeCommand
            {
                ParticipantSeqId = existing.ParticipantSeqId,
                OriginalRangeStart = existing.RangeStart,
                RangeStart = new DateTime(2024, 1, 2),
                RangeEnd = new DateTime(2024, 1, 12),
                Description = "Adjusted",
            };

            var updated = new ExcludedDateRange
            {
                ParticipantSeqId = command.ParticipantSeqId,
                RangeStart = command.RangeStart,
                RangeEnd = command.RangeEnd,
                Description = command.Description,
                CreateDate = DateTime.UtcNow,
            };

            _excludedTripsDal
                .Setup(dal => dal.UpdateExcludedTripAsync(command.ParticipantSeqId, command.RangeStart, command.RangeEnd, command.Description, command.OriginalRangeStart))
                .ReturnsAsync(updated);

            var result = await _sut.UpdateAsync(command);

            Assert.Equal(updated, result);
            _excludedTripsDal.Verify(dal => dal.UpdateExcludedTripAsync(command.ParticipantSeqId, command.RangeStart, command.RangeEnd, command.Description, command.OriginalRangeStart), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_CallsDal()
        {
            var command = new ExcludedDateRangeDeleteCommand
            {
                ParticipantSeqId = 42,
                RangeStart = new DateTime(2024, 1, 1),
            };

            await _sut.DeleteAsync(command);

            _excludedTripsDal.Verify(dal => dal.DeleteExcludedTripAsync(command.ParticipantSeqId, command.RangeStart), Times.Once);
        }
    }
}
