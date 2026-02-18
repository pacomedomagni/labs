using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Trips
{
    [SingletonService]
    public interface IExcludedDateRangeOrchestrator
    {
        Task<IEnumerable<ExcludedDateRange>> GetByParticipantAsync(int participantSeqId);
        Task<ExcludedDateRange> InsertAsync(ExcludedDateRangeCommand command);
        Task<ExcludedDateRange> UpdateAsync(ExcludedDateRangeCommand command);
        Task DeleteAsync(ExcludedDateRangeDeleteCommand command);
    }

    public class ExcludedDateRangeOrchestrator : IExcludedDateRangeOrchestrator
    {
        private readonly ILogger<ExcludedDateRangeOrchestrator> _logger;
        private readonly IExcludedTripsDal _excludedTripsDal;

        public ExcludedDateRangeOrchestrator(
            ILogger<ExcludedDateRangeOrchestrator> logger,
            IExcludedTripsDal excludedTripsDal)
        {
            _logger = logger;
            _excludedTripsDal = excludedTripsDal;
        }

        public async Task<IEnumerable<ExcludedDateRange>> GetByParticipantAsync(int participantSeqId)
        {
            ValidateParticipantSeqId(participantSeqId);
            return await _excludedTripsDal.GetExcludedTripsByParticipantSeqId(participantSeqId);
        }

        public async Task<ExcludedDateRange> InsertAsync(ExcludedDateRangeCommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            ValidateParticipantSeqId(command.ParticipantSeqId);
            ValidateDateRange(command.RangeStart, command.RangeEnd);

            var result = await _excludedTripsDal.InsertExcludedTripAsync(
                command.ParticipantSeqId,
                command.RangeStart,
                command.RangeEnd,
                command.Description);

            if (result == null)
            {
                throw new InvalidOperationException("Failed to insert excluded date range.");
            }

            return result;
        }

        public async Task<ExcludedDateRange> UpdateAsync(ExcludedDateRangeCommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            ValidateParticipantSeqId(command.ParticipantSeqId);
            ValidateDateRange(command.RangeStart, command.RangeEnd);

            var originalRangeStart = command.OriginalRangeStart ?? command.RangeStart;

            if (!command.RangeStart.Equals(originalRangeStart))
            {
                await _excludedTripsDal.DeleteExcludedTripAsync(command.ParticipantSeqId, originalRangeStart);

                var inserted = await _excludedTripsDal.InsertExcludedTripAsync(
                    command.ParticipantSeqId,
                    command.RangeStart,
                    command.RangeEnd,
                    command.Description);

                if (inserted == null)
                {
                    throw new InvalidOperationException("Failed to update excluded date range.");
                }

                return inserted;
            }

            var result = await _excludedTripsDal.UpdateExcludedTripAsync(
                command.ParticipantSeqId,
                command.RangeStart,
                command.RangeEnd,
                command.Description,
                originalRangeStart);

            if (result == null)
            {
                throw new InvalidOperationException("Failed to update excluded date range.");
            }

            return result;
        }

        public async Task DeleteAsync(ExcludedDateRangeDeleteCommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            ValidateParticipantSeqId(command.ParticipantSeqId);

            if (command.RangeStart == DateTime.MinValue)
            {
                throw new ArgumentException("Range start is required for delete.", nameof(command));
            }

            await _excludedTripsDal.DeleteExcludedTripAsync(command.ParticipantSeqId, command.RangeStart);
        }

        private static void ValidateParticipantSeqId(int participantSeqId)
        {
            if (participantSeqId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(participantSeqId));
            }
        }

        private static void ValidateDateRange(DateTime rangeStart, DateTime rangeEnd)
        {
            if (rangeStart == DateTime.MinValue || rangeEnd == DateTime.MinValue)
            {
                throw new ArgumentException("Range start and end are required.");
            }

            if (rangeStart > rangeEnd)
            {
                throw new ArgumentException("Range start must be before or equal to range end.");
            }
        }
    }
}
