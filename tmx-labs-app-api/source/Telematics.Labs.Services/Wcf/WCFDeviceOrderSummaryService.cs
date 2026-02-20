using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFDeviceOrderSummaryService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFDeviceOrderSummaryService
    {
        Task<GetDeviceOrderSummaryResponse> GetByStatus(GetDeviceOrderSummaryByStatusRequest request);
    }

    public class WCFDeviceOrderSummaryService : WcfService<DeviceOrderSummaryServiceClient>, IWCFDeviceOrderSummaryService
    {
        public WCFDeviceOrderSummaryService(
            ILogger<WCFDeviceOrderSummaryService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFDeviceOrderSummaryServiceClient) { }

        public async Task<GetDeviceOrderSummaryResponse> GetByStatus(GetDeviceOrderSummaryByStatusRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetByStatusAsync(request), 
                logger, "Unable to get device order summary from MyScoreBusiness");
            return response;
        }
    }
}
