using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
    public interface IDeviceApi
    {
        Task<MobileDevice> GetDevice(int deviceSeqId);
        Task<string> GetAudioStatus(string deviceSerialNumber);
        Task<bool> SetAudioStatus(string deviceSerialNumber, bool isAudioOn);
        Task<List<Registration>> GetRegistrations(string telematicsId);
        Task<Registration> GetRegistration(string mobileRegistrationCode, ProgramCode programCode);
        Task<List<Registration>> GetRegistrationsByGroupExternalId(string groupExternalId);
        Task<List<Registration>> GetUnfilteredRegistrations(string mobileRegistrationCode);
        Task<bool> UpdateRegistration(string mobileRegistrationCode, int seqId, MobileRegistrationStatus registrationStatus);
    }

    public class DeviceApi : ModernApiBase<DeviceApi>, IDeviceApi
    {
        public DeviceApi(ILogger<DeviceApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.DeviceApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            this.client.BaseAddress = new Uri(configUrl);
        }

        public async Task<MobileDevice> GetDevice(int deviceSeqId)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.DeviceSeqId, deviceSeqId));

            var endpoint = string.Format(config.Endpoints["DeviceData"], deviceSeqId);
            return await NotFoundNullResponseHandler<MobileDevice>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"Device not found by {nameof(DeviceApi)}",
                (response) => $"({response.StatusCode}) Failure getting device from {nameof(DeviceApi)}");
        }

        public async Task<string> GetAudioStatus(string deviceSerialNumber)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.DeviceSerialNumber, deviceSerialNumber));

            var endpoint = string.Format(config.Endpoints["GetAudioStatus"], deviceSerialNumber);
            return await NotFoundNullResponseHandler<string>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"Device not found by {nameof(DeviceApi)}",
                (response) => $"({response.StatusCode}) Failure getting audio status from {nameof(DeviceApi)}");
        }

        public async Task<List<Registration>> GetRegistrations(string telematicsId)
        {
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, telematicsId));

            var endpoint = string.Format(config.Endpoints["MobileRegistrationData"], telematicsId);
            return await NotFoundNullResponseHandler<List<Registration>>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No registration data found by {nameof(DeviceApi)}",
                (response) => $"({response.StatusCode}) Failure getting registration data from {nameof(DeviceApi)}");
        }

        public async Task<Registration> GetRegistration(string mobileRegistrationCode, ProgramCode programCode)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.MobileRegistrationCode, mobileRegistrationCode),
                (LoggingConstants.ProgramCode, programCode));

            var endpoint = string.Format(config.Endpoints["MobileRegistrationStatus"], (int)programCode, mobileRegistrationCode);
            return await NotFoundNullResponseHandler<Registration>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No registration data found by {nameof(DeviceApi)}",
                (response) => $"({response.StatusCode}) Failure getting registration data from {nameof(DeviceApi)}");
        }

        public async Task<List<Registration>> GetRegistrationsByGroupExternalId(string groupExternalId)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.GroupExternalId, groupExternalId));

            var endpoint = string.Format(config.Endpoints["MobileRegistrationsWithEmbedByGroupExternalId"], groupExternalId);
            return await NotFoundNullResponseHandler<List<Registration>>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No registration data found by {nameof(DeviceApi)}",
                (response) => $"({response.StatusCode}) Failure getting registration data from {nameof(DeviceApi)}");
        }

        public async Task<bool> SetAudioStatus(string deviceSerialNumber, bool isAudioOn)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.DeviceSerialNumber, deviceSerialNumber));

            var endpoint = string.Format(config.Endpoints["SetAudioStatus"], deviceSerialNumber);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PatchAsync(endpoint, SerializeModelForRequest(new { IsAudioOn = isAudioOn, DeviceSerialNumber = deviceSerialNumber })),
                (response) => $"({response.StatusCode}) Failure setting audio status from {nameof(DeviceApi)}");
        }

        public async Task<List<Registration>> GetUnfilteredRegistrations(string mobileRegistrationCode)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.MobileRegistrationCode, mobileRegistrationCode));

            var endpoint = string.Format(config.Endpoints["UnfilteredRegistrations"], mobileRegistrationCode);
            return await NotFoundNullResponseHandler<List<Registration>>(
                endpoint,
                () => client.GetAsync(endpoint),
                () => $"No registration data found by {nameof(DeviceApi)}",
                (response) => $"({response.StatusCode}) Failure getting registration data from {nameof(DeviceApi)}");
        }

        public async Task<bool> UpdateRegistration(string mobileRegistrationCode, int seqId, MobileRegistrationStatus registrationStatus)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.MobileRegistrationCode, mobileRegistrationCode));

            var endpoint = string.Format(config.Endpoints["UpdateMobileRegistration"], mobileRegistrationCode);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PutAsync(endpoint, SerializeModelForRequest(new { MobileRegistrationSeqId = seqId, MobileRegistrationStatusCode = (int)registrationStatus, MobileRegistrationCode = mobileRegistrationCode })),
                (response) => $"({response.StatusCode}) Failure updating registration data from {nameof(DeviceApi)}");
        }
    }
}
