using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface ITmxPolicyApi
    {
        Task<bool> EnrollSnapshotParticipant(string policyNumber, string participantExternalId, string driverReferenceId, string phoneNumber, string deviceExperienceType, string mobileAppName, string action);
        Task<bool> UnenrollSnapshotParticipant(string policyNumber, string participantExternalId, string driverReferenceId, string deviceExperienceType, string mobileAppName, string action,string reason);
    }
    public class TmxPolicyApi : ModernApiBase<TmxPolicyApi>, ITmxPolicyApi
    {
        public TmxPolicyApi(ILogger<TmxPolicyApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.TmxPolicyApi)
        {
            string configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.AWS);
            this.client.BaseAddress = new Uri(configUrl);
        }

        public async Task<bool> EnrollSnapshotParticipant(string policyNumber, string participantExternalId, string driverReferenceId, string phoneNumber, string deviceExperienceType, string mobileAppName, string action)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.ParticipantExternalId, participantExternalId),
                (LoggingConstants.DriverReferenceId, driverReferenceId),
                (LoggingConstants.DeviceExperienceType, deviceExperienceType),
                (LoggingConstants.AppName, mobileAppName),
                (LoggingConstants.SnapshotEnrollmentAction, action),
                (LoggingConstants.PhoneNumber, phoneNumber));

            var endpoint = config.Endpoints["SnapshotEnrollment"];
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PostAsync(endpoint, SerializeModelForRequest(new
                {
                    policyNumber,
                    participantExternalId,
                    driverReferenceId,
                    deviceExperienceType,
                    mobileAppName,
                    action,
                    phoneNumber
                })),
                (response) => $"({response.StatusCode}) Failure calling SnapshotEnrollment from {nameof(TmxPolicyApi)}");
        }

        public async Task<bool> UnenrollSnapshotParticipant(string policyNumber, string participantExternalId, string driverReferenceId, string deviceExperienceType, string mobileAppName, string action, string reason)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.ParticipantExternalId, participantExternalId),
                (LoggingConstants.DriverReferenceId, driverReferenceId),
                (LoggingConstants.DeviceExperienceType, deviceExperienceType),
                (LoggingConstants.AppName, mobileAppName),
                (LoggingConstants.SnapshotEnrollmentAction, action),
                (LoggingConstants.Reason, reason));

            var endpoint = config.Endpoints["SnapshotEnrollment"];
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PostAsync(endpoint, SerializeModelForRequest(new
                {
                    policyNumber,
                    participantExternalId,
                    driverReferenceId,
                    deviceExperienceType,
                    mobileAppName,
                    action,
                    reason
                })),
                (response) => $"({response.StatusCode}) Failure calling SnapshotEnrollment from {nameof(TmxPolicyApi)}");
        }
    }
}
