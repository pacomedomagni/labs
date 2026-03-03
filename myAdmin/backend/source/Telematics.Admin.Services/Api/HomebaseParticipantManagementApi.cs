using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Services.Api
{
	public interface IHomebaseParticipantManagementApi
	{
		Task<HomebasePolicySummaryResponse> GetPolicySummary(string policyNumber);
        Task<HomebasePolicySummaryResponse> GetPolicySummaryV2(string policyNumber);
        Task<HomebaseParticipantSummaryResponse> GetParticipantSummary(string telematicsId);
        Task<HomebaseParticipantMobileDeviceResponse> GetParticipantMobileDevice(string telematicsId);
	}

	public class HomebaseParticipantManagementApi : ModernApiBase<HomebaseParticipantManagementApi>, IHomebaseParticipantManagementApi
	{
		public HomebaseParticipantManagementApi(ILogger<HomebaseParticipantManagementApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
			: base(logger, clientFactory, options.Value.HomebaseParticipantManagementApi)
		{
			string configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.AWS);
			this.client.BaseAddress = new Uri(configUrl);
		}

		public async Task<HomebasePolicySummaryResponse> GetPolicySummary(string policyNumber)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

			var endpoint = string.Format(config.Endpoints["PolicySummary"], policyNumber);
			return await NotFoundNullResponseHandler<HomebasePolicySummaryResponse>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No policy data found by {nameof(HomebaseParticipantManagementApi)}",
				(response) => $"({response.StatusCode}) Failure getting policy data from {nameof(HomebaseParticipantManagementApi)}");
		}

        public async Task<HomebasePolicySummaryResponse> GetPolicySummaryV2(string policyNumber)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

            var endpoint = string.Format(config.Endpoints["PolicySummaryV2"], policyNumber);
            return await NotFoundNullResponseHandler<HomebasePolicySummaryResponse>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No policy data found by {nameof(HomebaseParticipantManagementApi)}",
                (response) => $"({response.StatusCode}) Failure getting policy data from {nameof(HomebaseParticipantManagementApi)}");
        }

        public async Task<HomebaseParticipantMobileDeviceResponse> GetParticipantMobileDevice(string telematicsId)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, telematicsId));

            var endpoint = string.Format(config.Endpoints["ParticipantMobileDevice"], telematicsId);
            return await NotFoundNullResponseHandler<HomebaseParticipantMobileDeviceResponse>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No participant mobile device data found by {nameof(HomebaseParticipantManagementApi)}",
                (response) => $"({response.StatusCode}) Failure getting participant mobile device data from {nameof(HomebaseParticipantManagementApi)}");
        }
		public async Task<HomebaseParticipantSummaryResponse> GetParticipantSummary(string telematicsId)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, telematicsId));

			var endpoint = string.Format(config.Endpoints["ParticipantSummary"], telematicsId);
			return await NotFoundNullResponseHandler<HomebaseParticipantSummaryResponse>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No participant data found by {nameof(HomebaseParticipantManagementApi)}",
				(response) => $"({response.StatusCode}) Failure getting participant data from {nameof(HomebaseParticipantManagementApi)}");
		}
	}
}
