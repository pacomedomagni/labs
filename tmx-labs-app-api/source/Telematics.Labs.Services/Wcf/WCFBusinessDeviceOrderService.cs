using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFBusinessDeviceOrderService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFBusinessDeviceOrderService
    {
        Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrder(GetBusinessDeviceOrderRequest request);
        Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByParticipantGroup(GetBusinessDeviceOrderByParticipantGroupRequest request);
        Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByOrderStatus(GetBusinessDeviceOrderByOrderStatusRequest request);
    }

    public class WCFBusinessDeviceOrderService : WcfService<BusinessDeviceOrderServiceClient>, IWCFBusinessDeviceOrderService
    {
        public WCFBusinessDeviceOrderService(
            ILogger<WCFBusinessDeviceOrderService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFBusinessDeviceOrderServiceClient) { }

        public async Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrder(GetBusinessDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetBusinessDeviceOrderAsync(request), 
                logger, "Unable to get business device order");
            return response;
        }

        public async Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByParticipantGroup(GetBusinessDeviceOrderByParticipantGroupRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetBusinessDeviceOrderByParticipantGroupAsync(request), 
                logger, "Unable to get business device order by participant group");
            return response;
        }

        public async Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByOrderStatus(GetBusinessDeviceOrderByOrderStatusRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetBusinessDeviceOrderByOrderStatusAsync(request), 
                logger, "Unable to get business device order by order status");
            return response;
        }
    }
}
