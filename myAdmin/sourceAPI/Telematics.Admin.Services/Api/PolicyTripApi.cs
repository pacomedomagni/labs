using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface IPolicyTripApi
    {
        Task<TripsGetResponse> GetTrips(string participantId);
        Task<TripStatsGetResponse> GetTripStats(string participantId, DateTime startDate, DateTime endDate);
	}

    public class PolicyTripApi : ModernApiBase<PolicyTripApi>, IPolicyTripApi
    {
        public PolicyTripApi(ILogger<PolicyTripApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.PolicyTripApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            this.client.BaseAddress = new Uri(configUrl);
        }

        public async Task<TripsGetResponse> GetTrips(string participantId)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantId, participantId));

            var endpoint = string.Format(config.Endpoints["Trips"], participantId);
            return await NotFoundNullResponseHandler<TripsGetResponse>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No trip data found by {nameof(PolicyTripApi)}",
                (response) => $"({response.StatusCode}) Failure getting trip data from {nameof(PolicyTripApi)}");
        }

        public async Task<TripStatsGetResponse> GetTripStats(string participantId, DateTime startDate, DateTime endDate)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantId, participantId));

            var endpoint = string.Format(config.Endpoints["TripStats"], participantId, $"{startDate:s}", $"{endDate:s}");
            return await NotFoundNullResponseHandler<TripStatsGetResponse>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No trip stats found by {nameof(PolicyTripApi)}",
                (response) => $"({response.StatusCode}) Failure getting trip stats from {nameof(PolicyTripApi)}");
        }
	}
}
