using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface IPolicyApi
    {
        Task<bool> SetPolicyAppAssignment(string policyNumber, string appName);
        Task<List<Registration>> GetMobileParticipantRegistrationInfo(string policyNumber);
        Task<List<ExcludedDateRangeReasonCode>> GetExcludedDateReasonCodes();
        Task<List<ExcludedDateRange>> GetExcludedDates(string participantId);
        Task<bool> AddExcludedDate(string participantId, DateTime rangeStartDateTime, DateTime rangeEndDateTime, int excludedDateRangeReasonCode, string description);
        Task<bool> UpdateExcludedDate(string participantId, DateTime rangeStartDateTime, DateTime rangeEndDateTime, int excludedDateRangeReasonCode, string description);
        Task<bool> DeleteExcludedDate(string participantId, DateTime startDate);
        Task<bool> MergeParticipant(string policyNumber, short policySuffix, string oldParticipantId, string newParticipantId);
    }

    public class PolicyApi : ModernApiBase<PolicyApi>, IPolicyApi
    {
        private readonly IHttpContextAccessor contextAccessor;

        public PolicyApi(ILogger<PolicyApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig, IHttpContextAccessor contextAccessor)
            : base(logger, clientFactory, options.Value.PolicyApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            this.client.BaseAddress = new Uri(configUrl);
            this.contextAccessor = contextAccessor;
        }

        public async Task<bool> SetPolicyAppAssignment(string policyNumber, string appName)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.ProgramCode, appName));

            var endpoint = string.Format(config.Endpoints["AppAssignment"], policyNumber);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PutAsync(endpoint, SerializeModelForRequest(new { appName })),
                (response) => $"({response.StatusCode}) Failure setting policy app assignment from {nameof(PolicyApi)}");
        }

        public async Task<List<Registration>> GetMobileParticipantRegistrationInfo(string policyNumber)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

            var endpoint = string.Format(config.Endpoints["MobileRegistrationStatus"], policyNumber);
            return await NotFoundNullResponseHandler<List<Registration>>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No registration data found by {nameof(PolicyApi)}",
                (response) => $"({response.StatusCode}) Failure getting registration data from {nameof(PolicyApi)}");
        }

        public async Task<List<ExcludedDateRangeReasonCode>> GetExcludedDateReasonCodes()
        {
            var endpoint = string.Format(config.Endpoints["ExcludedDateReasons"]);
            var response = await NotFoundNullResponseHandler<List<ExcludedDateRangeReasonCodeModel>>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No excluded date reason codes found by {nameof(PolicyApi)}",
                (response) => $"({response.StatusCode}) Failure getting excluded date reason codes from {nameof(PolicyApi)}");

            var data = response.Select(x => new ExcludedDateRangeReasonCode
            {
                Code = x.ExcludedDateRangeReasonCode,
                Description = x.ExcludedDateRangeReasonDesc,
                IsActive = x.ActiveInd
            }).ToList();

            return data;
        }

        public async Task<List<ExcludedDateRange>> GetExcludedDates(string participantId)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantId, participantId));

            var endpoint = string.Format(config.Endpoints["ExcludedDates"], participantId);
            return await NotFoundNullResponseHandler<List<ExcludedDateRange>>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No excluded date range data found by {nameof(PolicyApi)}",
                (response) => $"({response.StatusCode}) Failure getting excluded date range data from {nameof(PolicyApi)}");
        }

        public async Task<bool> AddExcludedDate(string participantId, DateTime rangeStartDateTime, DateTime rangeEndDateTime, int excludedDateRangeReasonCode, string description)
        {
            rangeStartDateTime = rangeStartDateTime.Truncate(TimeSpan.TicksPerMinute);
            rangeEndDateTime = rangeEndDateTime.Truncate(TimeSpan.TicksPerMinute);

            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantId, participantId));

            var endpoint = string.Format(config.Endpoints["ExcludedDateUpdate"], participantId);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PostAsync(endpoint, SerializeModelForRequest(new
                {
                    rangeStartDateTime,
                    rangeEndDateTime,
                    excludedDateRangeReasonCode,
                    description,
                    modByUserId = contextAccessor.CurrentUser()
                })),
                (response) => $"({response.StatusCode}) Failure adding excluded date range from {nameof(PolicyApi)}");
        }

        public async Task<bool> UpdateExcludedDate(string participantId, DateTime rangeStartDateTime, DateTime rangeEndDateTime, int excludedDateRangeReasonCode, string description)
        {
            rangeStartDateTime = rangeStartDateTime.Truncate(TimeSpan.TicksPerMinute);
            rangeEndDateTime = rangeEndDateTime.Truncate(TimeSpan.TicksPerMinute);

            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantId, participantId));

            var endpoint = string.Format(config.Endpoints["ExcludedDateUpdate"], participantId);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PutAsync(endpoint, SerializeModelForRequest(new
                {
                    rangeStartDateTime,
                    rangeEndDateTime,
                    excludedDateRangeReasonCode,
                    description,
                    modByUserId = contextAccessor.CurrentUser()
                })),
                (response) => $"({response.StatusCode}) Failure updating excluded date range from {nameof(PolicyApi)}");
        }

        public async Task<bool> DeleteExcludedDate(string participantId, DateTime startDate)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantId, participantId));

            var endpoint = string.Format(config.Endpoints["ExcludedDateDelete"], participantId, $"{startDate:s}");
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.DeleteAsync(endpoint),
                (response) => $"({response.StatusCode}) Failure deleting excluded date range from {nameof(PolicyApi)}");
        }


        public async Task<bool> MergeParticipant(string policyNumber, short policySuffix, string oldParticipantId, string newParticipantId)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

            var endpoint = string.Format(config.Endpoints["ParticipantMerge"]);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PutAsync(endpoint, SerializeModelForRequest(new
                {
                    policyNumber,
                    policySuffix,
                    newParticipantId,
                    oldParticipantId
                })),
                (response) => $"({response.StatusCode}) Failure merging participants from {nameof(PolicyApi)}");
        }
    }
}
