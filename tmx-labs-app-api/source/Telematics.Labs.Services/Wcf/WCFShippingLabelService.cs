using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFShippingLabelService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFShippingLabelService
    {
        Task<GetShippingLabelResponse> GetShippingLabel(GetShippingLabelRequest request);
        Task<GetShippingLabelResponse> GetHazmatShippingLabel(GetShippingLabelRequest request);
    }

    public class WCFShippingLabelService : WcfService<ShippingLabelServiceClient>, IWCFShippingLabelService
    {
        public WCFShippingLabelService(ILogger<WCFShippingLabelService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFShippingLabelServiceClient) { }

        public async Task<GetShippingLabelResponse> GetShippingLabel(GetShippingLabelRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetShippingLabelAsync(request), logger, "Unable to get shipping label");
            return response;
        }

        public async Task<GetShippingLabelResponse> GetHazmatShippingLabel(GetShippingLabelRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetHazmatShippingLabelAsync(request), logger, "Unable to get hazmat shipping label");
            return response;
        }
    }
}
