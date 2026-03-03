using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface IPolicyDeviceApi
    {
        Task<(bool Success, string ErrorMessage)> UpdateMobileRegistration(string policyNumber, int mobileRegistrationSeqId, RegistrationStatusUpdateAction action);
    }

    public class PolicyDeviceApi : ModernApiBase<PolicyDeviceApi>, IPolicyDeviceApi
    {
        private readonly IHttpContextAccessor contextAccessor;

        public PolicyDeviceApi(ILogger<PolicyDeviceApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig, IHttpContextAccessor contextAccessor)
            : base(logger, clientFactory, options.Value.PolicyDeviceApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            this.client.BaseAddress = new Uri(configUrl);
            this.contextAccessor = contextAccessor;
        }

        public async Task<(bool Success, string ErrorMessage)> UpdateMobileRegistration(string policyNumber, int mobileRegistrationSeqId, RegistrationStatusUpdateAction action)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.MobileRegistrationSeqId, mobileRegistrationSeqId));

            var endpoint = string.Format(config.Endpoints["MobileRegistrationStatusUpdate"], mobileRegistrationSeqId, policyNumber, contextAccessor.CurrentUser(), action, RegistrationStatusUpdateAction.None);
            var response = await SuccessFailureResponseHandler(
                endpoint,
                () => client.PutAsync(endpoint, null),
                (response) => $"({response.StatusCode}) Failure updating registration data from {nameof(PolicyDeviceApi)}");

            if (response.IsSuccessStatusCode)
            {
                return (true, string.Empty);
            }
            else
            {
                var telematicsResponse = await UnwrapTelematicsExceptionMessage(response);
                logger.LogError(LoggingEvents.PolicyDeviceApi_UpdateMobileRegistration, nameof(PolicyDeviceApi) + " - {ErrorMessage}", (string)telematicsResponse.Message);
                return (false, telematicsResponse.Message);
            }
        }
    }
}
