using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFTrackingNumberService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFTrackingNumberService
    {
        Task<AddTrackingNumberResponse> Add(AddTrackingNumberRequest request);
        Task<GetReturnTrackingNumbersResponse> GetReturnTrackingNumbersByOrderSeqId(GetReturnTrackingNumbersRequest request);
        Task<GetTrackingNumbersResponse> GetTrackingNumbersByOrderSeqId(GetTrackingNumbersRequest request);
        Task<UpdateReturnTrackingIsActiveResponse> UpdateReturnTrackingIsActive(UpdateReturnTrackingIsActiveRequest request);
    }

    public class WCFTrackingNumberService : WcfService<TrackingNumberServiceClient>, IWCFTrackingNumberService
    {
        public WCFTrackingNumberService(ILogger<WCFTrackingNumberService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFTrackingNumberServiceClient) { }

        public async Task<AddTrackingNumberResponse> Add(AddTrackingNumberRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.AddAsync(request), logger, "Unable to add tracking number");
            return response;
        }

        public async Task<GetReturnTrackingNumbersResponse> GetReturnTrackingNumbersByOrderSeqId(GetReturnTrackingNumbersRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetReturnTrackingNumbersByOrderSeqIdAsync(request), logger, "Unable to get return tracking numbers by order seq id");
            return response;
        }

        public async Task<GetTrackingNumbersResponse> GetTrackingNumbersByOrderSeqId(GetTrackingNumbersRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetTrackingNumbersByOrderSeqIdAsync(request), logger, "Unable to get tracking numbers by order seq id");
            return response;
        }

        public async Task<UpdateReturnTrackingIsActiveResponse> UpdateReturnTrackingIsActive(UpdateReturnTrackingIsActiveRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateReturnTrackingIsActiveAsync(request), logger, "Unable to update return tracking is active");
            return response;
        }
    }
}
