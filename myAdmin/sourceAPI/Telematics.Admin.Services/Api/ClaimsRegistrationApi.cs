using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface IClaimsRegistrationApi
    {
        Task<(bool Success, string ErrorMessage)> UpdateMobileRegistrationCode(string currentMobileRegistrationCode, string newMobileRegistrationCode, string telematicsId);
		Task<List<Registration>> GetRegistrations(string telematicsId, bool includeOtherRegistrations = true);
        Task<(bool Success, string ErrorMessage)> UnlockRegistration(string telematicsId);
		Task<MobileRegistrationsModel> GetMobileRegistrations(string mobileRegistrationCode);
        Task<MobileRegistrationsModel> GetRegistrationsByTelematicsId(string telematicsId);
        Task<List<Registration>> GetRegistrationsByPolicyNumber(string policyNumber);
	}


	public class ClaimsRegistrationApi : ModernApiBase<ClaimsRegistrationApi>, IClaimsRegistrationApi
    {
        IPolicyDAL _policyDAL;

        public ClaimsRegistrationApi(
            ILogger<ClaimsRegistrationApi> logger,
            IHttpClientFactory clientFactory,
            IOptions<ServicesConfig> options,
            IOptions<EnvironmentPrefixes> envConfig,
            IPolicyDAL policyDAL)
            : base(logger, clientFactory, options.Value.ClaimsRegistrationApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.EnvironmentName);
            this.client.BaseAddress = new Uri(configUrl);
            _policyDAL = policyDAL;
        }

		public async Task<List<Registration>> GetRegistrations(string telematicsId, bool includeOtherRegistrations = true)
		{
			using var loggingScope = logger.BeginPropertyScope(
				("TelematicsId", telematicsId));

			string endpoint = $"{config.Endpoints["GetRegistrations"]}?telematicsId={telematicsId}&includeOtherRegistrations={includeOtherRegistrations}";

			var response = await NotFoundNullResponseHandler<MobileRegistrationsModel>(
			  endpoint,
			  () => client.GetAsync(endpoint),
              () => $"No mobile registrations found by {nameof(ClaimsRegistrationApi)}",
			  (response) => $"({response.StatusCode}) Failure getting mobile registrations in {nameof(ClaimsRegistrationApi)}");

            var registration = response?.ActiveRegistration ?? response?.OtherRegistrations?.FirstOrDefault();

			return registration == null ? null :
							new List<Registration>
							{
								new Registration
                                {
                                    MobileRegistrationCode = registration.MobileRegistrationCode,
									ParticipantExternalId = registration.TelematicsId,
                                    StatusSummary = RegistrationsModel.MapMobileRegistrationStatusSummary(registration.StatusSummary),
									ChallengeRequestCount = registration.ChallengeRequestCount,
                                    ChallengeExpirationDateTime = registration.ChallengeExpirationDateTime,
                                    MobileDeviceId = registration.MobileDevice?.MobileDeviceId,
                                    MobileChallengeCode = registration.ChallengeCode,
									MobileLastRegistrationDateTime = registration.MobileLastRegistrationDateTime
								}
							};
		}

        public async Task<(bool Success, string ErrorMessage)> UpdateMobileRegistrationCode(string currentMobileRegistrationCode, string newMobileRegistrationCode, string telematicsId)
        {
            using var loggingScope = logger.BeginPropertyScope(
                ("CurrentMobileRegistrationCode", currentMobileRegistrationCode),
                ("TelematicsId", telematicsId));

            string endpoint = string.Format(config.Endpoints["UpdateMobileRegistrationCode"]);
            HttpResponseMessage response = await SuccessFailureResponseHandler(
                endpoint,
                () => client.PostAsync(endpoint, SerializeModelForRequest(
                    new
                    {
                        currentMobileRegistrationCode,
                        newMobileRegistrationCode,
                        telematicsId
                    })),
                (response) => $"({response.StatusCode}) Failure updating mobile registration code {nameof(ClaimsRegistrationApi)}");

            if (response.IsSuccessStatusCode)
            {
                return (true, string.Empty);
            }
            else
            {
                var registrationResponse = await UnwrapModernTelematicsExceptionMessage(response);
                logger.LogError("ClaimsRegistrationApi_UpdateMobileRegistrationCode", nameof(ClaimsRegistrationApi) + " - {ErrorMessage}", (string)registrationResponse.DeveloperMessage);
                return (false, registrationResponse.DeveloperMessage);
            }
        }

        public async Task<(bool Success, string ErrorMessage)> UnlockRegistration(string telematicsId)
        {
			using var loggingScope = logger.BeginPropertyScope(
			   ("TelematicsId", telematicsId));

			string endpoint = string.Format(config.Endpoints["UnlockRegistration"]);
			HttpResponseMessage response = await SuccessFailureResponseHandler(
			   endpoint,
			   () => client.PostAsync(endpoint, SerializeModelForRequest(
				   new
				   {
					   telematicsId
				   })),
			   (response) => $"({response.StatusCode}) Failure unlocking registration from {nameof(ClaimsRegistrationApi)}");

			if (response.IsSuccessStatusCode)
			{
				return (true, string.Empty);
			}
			else
			{
				var errorResponse = await UnwrapModernTelematicsExceptionMessage(response);
				return (false, errorResponse.DeveloperMessage);
			}
		}

		public async Task<MobileRegistrationsModel> GetMobileRegistrations(string mobileRegistrationCode)
		{
			using var loggingScope = logger.BeginPropertyScope(
				("MobileRegistrationCode", mobileRegistrationCode));

			string endpoint = string.Concat(config.Endpoints["GetRegistrations"], $"?mobileRegistrationCode={mobileRegistrationCode}&includeOtherRegistrations=true");
			return await NotFoundNullResponseHandler<MobileRegistrationsModel>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No mobile registration data found by {nameof(ClaimsRegistrationApi)}",
				(response) => $"({response.StatusCode}) Failure searching for mobile registrations {nameof(ClaimsRegistrationApi)}");
		}

        public async Task<MobileRegistrationsModel> GetRegistrationsByTelematicsId(string telematicsId)
        {
            using var loggingScope = logger.BeginPropertyScope(
                ("TelematicsId", telematicsId));

            string endpoint = string.Concat(config.Endpoints["GetRegistrations"], $"?telematicsId={telematicsId}&includeOtherRegistrations=true");
            return await NotFoundNullResponseHandler<MobileRegistrationsModel>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No mobile registration data found by {nameof(ClaimsRegistrationApi)}",
                (response) => $"({response.StatusCode}) Failure searching for mobile registrations {nameof(ClaimsRegistrationApi)}");
        }

        public async Task<List<Registration>> GetRegistrationsByPolicyNumber(string policyNumber)
        {
            var registrations = new List<Registration>();

            try
            {
                var telematicsDrivers = await _policyDAL.GetTelematicsDriversByPolicyNumber(policyNumber);

                var registrationApiTasks = telematicsDrivers.Select(async driver =>
                {
                    var getRegistrationsResult = await GetRegistrationsByTelematicsId(driver.ParticipantExternalId);

                    if (getRegistrationsResult != null)
                    {
                        var registrationsModel = getRegistrationsResult.ActiveRegistration != null ? getRegistrationsResult.ActiveRegistration : getRegistrationsResult.OtherRegistrations.FirstOrDefault();

                        var registration = new Registration
                        {
                            ParticipantExternalId = registrationsModel.TelematicsId,
                            MobileDeviceId = registrationsModel.MobileDevice?.MobileDeviceId,
                            MobileRegistrationCode = registrationsModel.MobileRegistrationCode,
                            MobileChallengeCode = registrationsModel.ChallengeCode,
                            ChallengeRequestCount = registrationsModel.ChallengeRequestCount,
                            ChallengeExpirationDateTime = registrationsModel.ChallengeExpirationDateTime,
                            StatusSummary = RegistrationsModel.MapMobileRegistrationStatusSummary(registrationsModel.StatusSummary),
                            MobileLastRegistrationDateTime = registrationsModel.MobileLastRegistrationDateTime,
                            DriverFirstName = driver.DriverFirstName,
                            DriverLastName = driver.DriverLastName
                        };

                        registrations.Add(registration);
                    }
                }).ToList();

                await Task.WhenAll(registrationApiTasks);
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_ModernFunctionalityError,
                    ex,
                    $"Error occurred while retrieving registrations."
                );
                return null;
            }
            return registrations;
        }
    }
}
