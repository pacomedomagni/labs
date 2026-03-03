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
	public interface IUbiApi
	{
		Task<SnapshotSummaryResponse> GetPolicySummary(string policyNumber);
		Task<SnapshotParticipant> GetParticipantSnapshotSummary(string telematicsId);

	}

	public class UbiApi : ModernApiBase<UbiApi>, IUbiApi
    {
		public UbiApi(ILogger<UbiApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
			: base(logger, clientFactory, options.Value.UbiApi)
		{
			string configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.EnvironmentName);
			this.client.BaseAddress = new Uri(configUrl);
		}

		public async Task<SnapshotParticipant> GetParticipantSnapshotSummary(string telematicsId)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, telematicsId));
			var endpoint = string.Format(config.Endpoints["ParticipantSnapshotSummary"], telematicsId);
			return await NotFoundNullResponseHandler<SnapshotParticipant>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No participant data found by {nameof(UbiApi)}",
				(response) => $"({response.StatusCode}) Failure getting participant data from {nameof(UbiApi)}");
		}

		public async Task<SnapshotSummaryResponse> GetPolicySummary(string policyNumber)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

			var endpoint = string.Format(config.Endpoints["SnapshotSummary"], policyNumber);
			return await NotFoundNullResponseHandler<SnapshotSummaryResponse>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No policy data found by {nameof(UbiApi)}",
				(response) => $"({response.StatusCode}) Failure getting policy data from {nameof(UbiApi)}");
		}
	}
}
