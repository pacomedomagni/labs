using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Configs;
using Progressive.WAM.Webguard.Client.Core.Wcf;

namespace Progressive.Telematics.Labs.Services.Api
{
    public interface IApplicationConfigApi
    {
     
        Task<ApplicationConfig> GetPolicy(string policyNumber);
    }

    public class ApplicationConfigApi : ModernApiBase<ApplicationConfigApi>, IApplicationConfigApi
    {
        public ApplicationConfigApi(ILogger<ApplicationConfigApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.PolicyServicingApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            client.BaseAddress = new Uri(configUrl);
            client.DefaultRequestHeaders.Add("api_key", ((ApiGatewayConfig)config).ApiKey);
        }
        public async Task<ApplicationConfig> GetPolicy(string policyNumber)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

            var endpoint = string.Format(config.Endpoints["GetPolicy"], policyNumber);

            return await NotFoundNullResponseHandler<ApplicationConfig>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No policy data found by {nameof(ApplicationConfigApi)}",
                (response) => $"({response.StatusCode}) Failure getting policy data from {nameof(ApplicationConfigApi)}");
        }
    }
}

