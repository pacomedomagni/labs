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
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;
using Progressive.WAM.Webguard.Client.Core.Wcf;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface IPolicyServicingApi
    {
     
        Task<PolicyServicingPolicy> GetPolicy(string policyNumber);
    }

    public class PolicyServicingApi : ModernApiBase<PolicyServicingApi>, IPolicyServicingApi
    {
        public PolicyServicingApi(ILogger<PolicyServicingApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.PolicyServicingApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            this.client.BaseAddress = new Uri(configUrl);
            this.client.DefaultRequestHeaders.Add("api_key", ((ApiGatewayConfig)config).ApiKey);
        }
        public async Task<PolicyServicingPolicy> GetPolicy(string policyNumber)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

            var endpoint = string.Format(config.Endpoints["GetPolicy"], policyNumber);

            return await NotFoundNullResponseHandler<PolicyServicingPolicy>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No policy data found by {nameof(PolicyServicingApi)}",
                (response) => $"({response.StatusCode}) Failure getting policy data from {nameof(PolicyServicingApi)}");
        }
    }
}
