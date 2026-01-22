using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WcfValueCalculator;
using WcfVinPicklistService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IVinPicklistService
    {
        Task<VinPicklistYearsResponse> GetVehicleYears();
        Task<VinPicklistMakesResponse> GetVehicleMakes(string year);
        Task<VinPicklistModelsResponse> GetVehicleModels(string year, string make);
    }

    public class VinPicklistService : WcfService<VinPicklistServiceClient>, IVinPicklistService
    {
        private readonly VinPicklistConfig _config;

        public VinPicklistService(ILogger<VinPicklistService> logger, IWcfServiceFactory factory, IOptions<VinPicklistConfig> config)
            : base(logger, factory.CreateVinPicklistServiceClient)
        {
            _config = config.Value;
        }


        public async Task<VinPicklistYearsResponse> GetVehicleYears()
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.VinPicklistYearsAsync(new VinPicklistYearsRequest()
            {
            }), logger);
            return response;
        }

        public async Task<VinPicklistMakesResponse> GetVehicleMakes(string year)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.VinPicklistMakesAsync(new VinPicklistMakesRequest()
            {
                Year = year
            }), logger);
            return response;
        }

        public async Task<VinPicklistModelsResponse> GetVehicleModels(string year, string make)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.VinPicklistModelsAsync(new VinPicklistModelsRequest()
            {
                Year = year,
                Make = make,
                FileDate = _config.FileDate,
                State = _config.State
            }), logger);
            return response;
        }
    }
}
