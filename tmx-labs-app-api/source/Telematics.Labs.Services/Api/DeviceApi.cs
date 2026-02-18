using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Api
{
    public interface IDeviceApi
    {
        Task<string> GetAudioStatus(string deviceSerialNumber);
        Task<bool> SetAudioStatus(string deviceSerialNumber, bool isAudioOn);
    }

    public class DeviceApi : ModernApiBase<DeviceApi>, IDeviceApi
    {
        public DeviceApi(ILogger<DeviceApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, clientFactory, options.Value.DeviceApi)
        {
            var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
            client.BaseAddress = new Uri(configUrl);
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

        public async Task<bool> SetAudioStatus(string deviceSerialNumber, bool isAudioOn)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.DeviceSerialNumber, deviceSerialNumber));

            var endpoint = string.Format(config.Endpoints["SetAudioStatus"], deviceSerialNumber);
            return await TrueFalseResponseHandler(
                endpoint,
                () => client.PatchAsync(endpoint, SerializeModelForRequest(new { IsAudioOn = isAudioOn, DeviceSerialNumber = deviceSerialNumber })),
                (response) => $"({response.StatusCode}) Failure setting audio status from {nameof(DeviceApi)}");
        }
    }
}
