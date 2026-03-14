using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.ClTables;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
	public interface IClaimsParticipantManagementApi
	{
		Task<ClaimsPolicySummaryResponse> GetPolicySummary(string policyNumber);
		Task<ClaimsParticipantSummaryResponse> GetParticipantSummary(string telematicsId);
        Task<bool> Unenroll(string telematicsId, string unenrollReason);

    }

	public class ClaimsParticipantManagementApi : ModernApiBase<ClaimsParticipantManagementApi>, IClaimsParticipantManagementApi
	{
		public ClaimsParticipantManagementApi(ILogger<ClaimsParticipantManagementApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
			: base(logger, clientFactory, options.Value.ClaimsParticipantManagementApi)
		{
			var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.AWS);
			this.client.BaseAddress = new Uri(configUrl);
		}

		public async Task<ClaimsPolicySummaryResponse> GetPolicySummary(string policyNumber)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

			var endpoint = string.Format(config.Endpoints["PolicySummary"], policyNumber);
			var participants = await NotFoundNullResponseHandler<List<ClaimsParticipantSummaryResponse>>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No policy data found by {nameof(ClaimsParticipantManagementApi)}",
				(response) => $"({response.StatusCode}) Failure getting policy data from {nameof(ClaimsParticipantManagementApi)}");
			
			return participants == null ? null : 
				new ClaimsPolicySummaryResponse
				{
					PolicyNumber = policyNumber,
					ParticipantSummaries = participants
				};
		}

		public async Task<ClaimsParticipantSummaryResponse> GetParticipantSummary(string telematicsId)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, telematicsId));

			var endpoint = string.Format(config.Endpoints["ParticipantSummary"], telematicsId);
			return await NotFoundNullResponseHandler<ClaimsParticipantSummaryResponse>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No participant data found by {nameof(ClaimsParticipantManagementApi)}",
				(response) => $"({response.StatusCode}) Failure getting participant data from {nameof(ClaimsParticipantManagementApi)}");
		}

        public async Task<bool> Unenroll(string telematicsId, string unenrollReason)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, telematicsId));

            var endpoint = string.Format(config.Endpoints["Unenroll"]);


            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PatchAsync(endpoint, SerializeModelForRequest(new
                {
                    telematicsId,
					unenrollReason
                })),
                (response) => $"({response.StatusCode}) Failure calling Unenroll from {nameof(ClaimsParticipantManagementApi)}");
        }

    }
}
