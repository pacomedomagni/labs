using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfIneligibleVehiclesService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IIneligibleVehiclesService
    {
        Task<GetIneligibleVehiclesResponse> GetIneligibleVehicles(string year = "", string make = "", string model = "", string deviceDescription = "", bool? exactMatchInd = null);
    }

    public class IneligibleVehiclesService : WcfService<IneligibleVehiclesServiceClient>, IIneligibleVehiclesService
    {
        public IneligibleVehiclesService(ILogger<IneligibleVehiclesService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateIneligibleVehiclesClient) { }

        public async Task<GetIneligibleVehiclesResponse> GetIneligibleVehicles(string year = "", string make = "", string model = "", string deviceDescription = "", bool? exactMatchInd = null)
        {
            var ALL = "ALL";
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetIneligibleVehiclesAsync(new GetIneligibleVehiclesRequest
            {
                Description = string.IsNullOrWhiteSpace(deviceDescription) ? ALL : deviceDescription,
                ExactModelMatchIndicator = exactMatchInd.HasValue ? exactMatchInd.ToString() : ALL,
                ModelYear = string.IsNullOrWhiteSpace(year) ? ALL : year,
                Make = string.IsNullOrWhiteSpace(make) ? ALL : make,
                Model = string.IsNullOrWhiteSpace(model) ? ALL : model,
            }), logger, "Unable to get ineligible vehicles");
            return response;
        }
    }
}

