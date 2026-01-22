using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfDeviceLotService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IDeviceLotService
    {
        Task<GetDeviceLotByNameResponse> GetDeviceLot(string lotName);
        Task<GetDeviceLotResponse> GetDeviceLot(int lotSeqId);
        Task<GetReceiveDeviceLotsInProcessResponse> GetDeviceLotsInProcess();
        Task<ReceiveLotResponse> ReceiveLot(string lotName);
    }

    public class DeviceLotService : WcfService<DeviceLotServiceClient>, IDeviceLotService
    {
        public DeviceLotService(ILogger<DeviceLotService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateDeviceLotClient) { }

        public async Task<GetDeviceLotByNameResponse> GetDeviceLot(string lotName)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceLotByNameAsync(new GetDeviceLotByNameRequest
            {
                Name = lotName
            }), logger);
            return response;
        }

        public async Task<GetDeviceLotResponse> GetDeviceLot(int lotSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetAsync(new GetDeviceLotRequest
            {
                LotSeqID = lotSeqId
            }), logger);
            return response;
        }

        public async Task<GetReceiveDeviceLotsInProcessResponse> GetDeviceLotsInProcess()
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetReceiveDeviceLotsInProcessAsync(), logger);
            return response;
        }

        public async Task<ReceiveLotResponse> ReceiveLot(string lotName)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.ReceiveLotAsync(new ReceiveLotRequest { Name = lotName }), logger);
            return response;
        }
    }
}

