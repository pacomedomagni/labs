//using Microsoft.Extensions.Logging;
//using Progressive.Telematics.Labs.Shared.Attributes;
//using System.Threading.Tasks;
//using PreviewFulfillmentService;

//namespace Progressive.Telematics.Labs.Services.Wcf
//{
//    [SingletonService]
//    public interface IPreviewFulfillmentService
//    {
//        Task<GetOrdersResponse> GetOrders(GetOrdersRequest request);
//        Task<GetOrderCountsResponse> GetOrderCounts(GetOrderCountsRequest request);
//        Task<GetStateOrderCountsResponse> GetStateOrderCounts(GetStateOrderCountsRequest request);
//        Task<AssignDevicesToOrderResponse> AssignDevicesToOrder(AssignDevicesToOrderRequest request);
//        Task<MarkOrdersShippedResponse> MarkOrdersShipped(MarkOrdersShippedRequest request);
//    }

//    public class PreviewFulfillmentService 
//        : WcfService<FulfillmentServiceClient>, IPreviewFulfillmentService
//    {
//        public PreviewFulfillmentService(
//            ILogger<PreviewFulfillmentService> logger, 
//            IWcfServiceFactory factory)
//            : base(logger, factory.CreatePreviewFulfillmentServiceClient) { }

//        public async Task<GetOrdersResponse> GetOrders(GetOrdersRequest request)
//        {
//            await using var client = CreateClient();
//            var response = await client.HandledCall(() => client.GetOrdersAsync(request), 
//                logger, "Unable to get preview orders");
//            return response;
//        }

//        public async Task<GetOrderCountsResponse> GetOrderCounts(GetOrderCountsRequest request)
//        {
//            await using var client = CreateClient();
//            var response = await client.HandledCall(() => client.GetOrderCountsAsync(request), 
//                logger, "Unable to get preview order counts");
//            return response;
//        }

//        public async Task<GetStateOrderCountsResponse> GetStateOrderCounts(GetStateOrderCountsRequest request)
//        {
//            await using var client = CreateClient();
//            var response = await client.HandledCall(() => client.GetStateOrderCountsAsync(request), 
//                logger, "Unable to get preview state order counts");
//            return response;
//        }

//        public async Task<AssignDevicesToOrderResponse> AssignDevicesToOrder(AssignDevicesToOrderRequest request)
//        {
//            await using var client = CreateClient();
//            var response = await client.HandledCall(() => client.AssignDevicesToOrderAsync(request), 
//                logger, "Unable to assign devices to preview order");
//            return response;
//        }

//        public async Task<MarkOrdersShippedResponse> MarkOrdersShipped(MarkOrdersShippedRequest request)
//        {
//            await using var client = CreateClient();
//            var response = await client.HandledCall(() => client.MarkOrdersShippedAsync(request), 
//                logger, "Unable to mark preview orders as shipped");
//            return response;
//        }
//    }
//}
