using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Services
{
    [SingletonService]
    public interface IDeviceValidationService
    {
        Task<DeviceFulfillmentValidation> ValidateDeviceForFulfillment(string deviceSerialNumber);
    }

    public class DeviceValidationService : IDeviceValidationService
    {
        private readonly IXirgoDeviceService _xirgoDeviceService;
        private readonly ILogger<DeviceValidationService> _logger;

        public DeviceValidationService(
            IXirgoDeviceService xirgoDeviceService,
            ILogger<DeviceValidationService> logger)
        {
            _xirgoDeviceService = xirgoDeviceService;
            _logger = logger;
        }

        public async Task<DeviceFulfillmentValidation> ValidateDeviceForFulfillment(string deviceSerialNumber)
        {
            var result = new DeviceFulfillmentValidation(deviceSerialNumber);

            if (string.IsNullOrWhiteSpace(deviceSerialNumber))
            {
                return result;
            }

            var deviceResult = await _xirgoDeviceService.GetDeviceBySerialNumber(deviceSerialNumber);

            if (deviceResult?.Device == null)
            {
                return result;
            }

            result.IsAvailable = deviceResult.Device.StatusCode == (int)DeviceStatus.Available;
            result.IsExistent = true;
            result.IsAssigned = (deviceResult.Device.StatusCode.HasValue && deviceResult.Device.StatusCode.Value == (int)DeviceStatus.Assigned);

            if (deviceResult.Device.BenchTestStatusCode.HasValue && deviceResult.Device.BenchTestStatusCode.Value == (int)DeviceBenchTestStatus.Completed)
            {
                result.IsBenchtested = true;
            }

            return result;
        }
    }
}
