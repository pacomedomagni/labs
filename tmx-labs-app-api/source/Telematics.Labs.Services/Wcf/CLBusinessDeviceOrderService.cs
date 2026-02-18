using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using CLBusinessDeviceOrderService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface ICLBusinessDeviceOrderService
    {
        Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrder(GetBusinessDeviceOrderRequest request);
        Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByPolicy(GetBusinessDeviceOrderByPolicyRequest request);
        Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByOrderStatus(GetBusinessDeviceOrderByOrderStatusRequest request);
    }

    public class CLBusinessDeviceOrderService 
        : WcfService<BusinessDeviceOrderServiceClient>, ICLBusinessDeviceOrderService
    {
        public CLBusinessDeviceOrderService(
            ILogger<CLBusinessDeviceOrderService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateCLBusinessDeviceOrderServiceClient) { }

        public async Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrder(GetBusinessDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetBusinessDeviceOrderAsync(request), 
                logger, "Unable to get business device order");
            return response;
        }

        public async Task<GetBusinessDeviceOrderResponse> GetBusinessDeviceOrderByPolicy(GetBusinessDeviceOrderByPolicyRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetBusinessDeviceOrderByPolicyAsync(request), 
                logger, "Unable to get business device order by policy");
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
