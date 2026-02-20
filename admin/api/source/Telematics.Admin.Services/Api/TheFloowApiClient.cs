using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Api;
using Progressive.Telematics.Admin.Services;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;
using UBICLBusiness.Core;

namespace TheFloowApi
{
    public interface ITheFloowApiClient
    {
        Task<HttpResponseMessage> UpdateEmailAddress(string policyNumber, string emailAddress);
    }

    public class TheFloowApiClient : ModernApiBase<ITheFloowApiClient>, ITheFloowApiClient
    {
        public TheFloowApiClient(ILogger<TheFloowApiClient> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.FloowApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            this.client.BaseAddress = new Uri(configUrl);
        }

        public async Task<HttpResponseMessage> UpdateEmailAddress(string policyNumber, string emailAddress)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));
            var model = new TheFloowEmailModel
            {
                emailAddress = emailAddress
            };
            //client.DefaultRequestHeaders.Authorization = new HttpListenerBasicIdentity(OAuthTokenCache.Instance.GetCache(), "Bearer");
            //client.DefaultRequestHeaders.Add("Content-Type", "application/json");

            // return await client.PutAsync($"/v1/policy/{policyNumber}/email-addresses", SerializeModelForRequest(model));

            var endpoint = string.Format(config.Endpoints["Update"], policyNumber);
            var returnValue = await NotFoundNullResponseHandler<HttpResponseMessage>(
                endpoint,
                () => client.PutAsync(endpoint, SerializeModelForRequest(model)),
                () => $"No trip data found by {nameof(TheFloowApiClient)}",
                (response) => $"({response.StatusCode}) Failure getting trip data from {nameof(TheFloowApiClient)}");
            return returnValue;

        }
    }
}
