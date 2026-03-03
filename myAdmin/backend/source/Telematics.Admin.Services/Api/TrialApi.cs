using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
	public interface ITrialApi
	{
		Task<bool> CheckMobileAvailability(string mobileRegistrationCode);
	}

	public class TrialApi : ModernApiBase<TrialApi>, ITrialApi
	{
		public TrialApi(ILogger<TrialApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
			: base(logger, clientFactory, options.Value.TrialApi)
		{
			var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
			this.client.BaseAddress = new Uri(configUrl);
		}

		public async Task<bool> CheckMobileAvailability(string mobileRegistrationCode)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.MobileRegistrationCode, mobileRegistrationCode));

			var endpoint = string.Format(config.Endpoints["MobileAvailability"], mobileRegistrationCode);
			return await TrueFalseResponseHandler(
					endpoint,
					() => client.GetAsync(endpoint),
					(response) => $"({response.StatusCode}) Failure getting registration data from {nameof(TrialApi)}");
		}
	}
}
