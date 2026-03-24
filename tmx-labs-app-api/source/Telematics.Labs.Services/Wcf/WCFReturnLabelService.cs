using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFReturnLabelService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFReturnLabelService
    {
        Task<GetReturnLabelResponse> GetDistributorReturnLabel();
        Task<GetReturnLabelResponse> GetSelfServiceReturnLabel();
        Task<GetReturnLabelResponse> GetUspsDistributorReturnLabel(GetReturnLabelRequest request);
        Task<GetReturnLabelResponse> GetUspsHazmatDistributorReturnLabel(GetReturnLabelRequest request);
        Task<GetReturnLabelResponse> GetUspsSelfServiceReturnLabel();
    }

    public class WCFReturnLabelService : WcfService<ReturnLabelServiceClient>, IWCFReturnLabelService
    {
        public WCFReturnLabelService(ILogger<WCFReturnLabelService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFReturnLabelServiceClient) { }

        public async Task<GetReturnLabelResponse> GetDistributorReturnLabel()
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDistributorReturnLabelAsync(), logger, "Unable to get distributor return label");
            return response;
        }

        public async Task<GetReturnLabelResponse> GetSelfServiceReturnLabel()
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetSelfServiceReturnLabelAsync(), logger, "Unable to get self service return label");
            return response;
        }

        public async Task<GetReturnLabelResponse> GetUspsDistributorReturnLabel(GetReturnLabelRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetUspsDistributorReturnLabelAsync(request), logger, "Unable to get USPS distributor return label");
            return response;
        }

        public async Task<GetReturnLabelResponse> GetUspsHazmatDistributorReturnLabel(GetReturnLabelRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetUspsHazmatDistributorReturnLabelAsync(request), logger, "Unable to get USPS hazmat distributor return label");
            return response;
        }

        public async Task<GetReturnLabelResponse> GetUspsSelfServiceReturnLabel()
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetUspsSelfServiceReturnLabelAsync(), logger, "Unable to get USPS self service return label");
            return response;
        }
    }
}
