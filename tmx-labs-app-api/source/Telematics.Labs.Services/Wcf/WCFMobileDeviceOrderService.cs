using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFMobileDeviceOrderService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFMobileDeviceOrderService
    {
        Task<FulfillMobileDeviceOrderResponse> Fulfill(FulfillMobileDeviceOrderRequest request);
    }

    public class WCFMobileDeviceOrderService : WcfService<MobileDeviceOrderServiceClient>, IWCFMobileDeviceOrderService
    {
        public WCFMobileDeviceOrderService(
            ILogger<WCFMobileDeviceOrderService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFMobileDeviceOrderServiceClient) { }

        public async Task<FulfillMobileDeviceOrderResponse> Fulfill(FulfillMobileDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.FulfillAsync(request), 
                logger, "Unable to fulfill mobile device order from MyScoreBusiness");
            return response;
        }
    }
}
