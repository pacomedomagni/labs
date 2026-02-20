using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFDeviceOrderService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFDeviceOrderService
    {
        Task<AddDeviceOrderResponse> Add(AddDeviceOrderRequest request);
        Task<DeleteDeviceOrderResponse> Delete(DeleteDeviceOrderRequest request);
        Task<FulfillDeviceOrderResponse> Fulfill(FulfillDeviceOrderRequest request);
        Task<GetDeviceOrderResponse> Get(GetDeviceOrderRequest request);
        Task<UpdateDeviceOrderResponse> Update(UpdateDeviceOrderRequest request);
        Task<AddDeviceOrderResponse> AddWithDetails(AddDeviceOrderWithDetailRequest request);
    }

    public class WCFDeviceOrderService : WcfService<DeviceOrderServiceClient>, IWCFDeviceOrderService
    {
        public WCFDeviceOrderService(
            ILogger<WCFDeviceOrderService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFDeviceOrderServiceClient) { }

        public async Task<AddDeviceOrderResponse> Add(AddDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.AddAsync(request), 
                logger, "Unable to add device order");
            return response;
        }

        public async Task<DeleteDeviceOrderResponse> Delete(DeleteDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.DeleteAsync(request), 
                logger, "Unable to delete device order");
            return response;
        }

        public async Task<FulfillDeviceOrderResponse> Fulfill(FulfillDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.FulfillAsync(request), 
                logger, "Unable to fulfill device order");
            return response;
        }

        public async Task<GetDeviceOrderResponse> Get(GetDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetAsync(request), 
                logger, "Unable to get device order");
            return response;
        }

        public async Task<UpdateDeviceOrderResponse> Update(UpdateDeviceOrderRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateAsync(request), 
                logger, "Unable to update device order");
            return response;
        }

        public async Task<AddDeviceOrderResponse> AddWithDetails(AddDeviceOrderWithDetailRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.AddWithDetailsAsync(request), 
                logger, "Unable to add device order with details");
            return response;
        }
    }
}
