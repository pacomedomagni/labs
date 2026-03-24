using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFAddressService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFAddressService
    {
        Task<GetStandardAddressResponse> GetStandardAddress(GetStandardAddressRequest request);
        Task<GetStandardAddressResponse> GetUspsStandardAddress(GetStandardAddressRequest request);
    }

    public class WCFAddressService : WcfService<AddressServiceClient>, IWCFAddressService
    {
        public WCFAddressService(ILogger<WCFAddressService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFAddressServiceClient) { }

        public async Task<GetStandardAddressResponse> GetStandardAddress(GetStandardAddressRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetStandardAddressAsync(request), logger, "Unable to get standard address");
            return response;
        }

        public async Task<GetStandardAddressResponse> GetUspsStandardAddress(GetStandardAddressRequest request)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetUspsStandardAddressAsync(request), logger, "Unable to get USPS standard address");
            return response;
        }
    }
}
