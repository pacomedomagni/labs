using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfEligibleZipCodesService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IEligibleZipCodesService
    {
        Task<GetEligibleZipCodesResponse> GetEligibleZipCodes(States? state = null, string zipCode = "");
    }

    public class EligibleZipCodesService : WcfService<EligibleZipCodesServiceClient>, IEligibleZipCodesService
    {
        public EligibleZipCodesService(ILogger<EligibleZipCodesService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateEligibleZipCodesClient) { }

        public async Task<GetEligibleZipCodesResponse> GetEligibleZipCodes(States? state = null, string zipCode = "")
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetEligibleZipCodesAsync(new GetEligibleZipCodesRequest
            {
                State = state?.ToString(),
                ZipCode = zipCode
            }), logger, "Unable to get eligible zip codes");
            return response;
        }
    }
}

