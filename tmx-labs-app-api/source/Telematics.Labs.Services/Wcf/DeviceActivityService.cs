using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfDeviceActivityService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IDeviceActivityService
    {
        Task<AddDeviceActivityResponse> AddDeviceActivity(int deviceSeqId, string description);
    }

    public class DeviceActivityService : WcfService<DeviceActivityServiceClient>, IDeviceActivityService
    {
        public DeviceActivityService(ILogger<DeviceActivityService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateDeviceActivityClient) { }

        public async Task<AddDeviceActivityResponse> AddDeviceActivity(int deviceSeqId, string description)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.DeviceSeqId, deviceSeqId));

            using var client = CreateClient();
            var response = await client.HandledCall(
                () => client.AddAsync(new AddDeviceActivityRequest
                {
                    Description = description,
                    DeviceSeqID = deviceSeqId
                }),
                logger,
                $"Add Device Activity failed. Transaction aborted.");
            return response;
        }
    }
}

