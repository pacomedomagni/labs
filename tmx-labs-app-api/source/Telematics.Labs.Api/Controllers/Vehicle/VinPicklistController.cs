using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Vehicle;
using Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.Vehicle
{
    [Route("Api/Vehicle/[controller]")]
    public class VinPicklistController() : TelematicsController<IVehiclePicklistOrchestrator>
    {
        [HttpGet("Years")]
        public async Task<VehicleModelYearsResponse> GetModelYears()
        {
            return await Orchestrator.GetModelYears();
        }

        [HttpGet("Makes")]
        public async Task<VehicleMakesResponse> GetMakes([FromQuery] string year)
        {
            return await Orchestrator.GetVehicleMakes(year);
        }

        [HttpGet("Models")]
        public async Task<VehicleModelsResponse> GetModels([FromQuery] string year, [FromQuery] string make)
        {
            return await Orchestrator.GetVehicleModels(year, make);
        }

        [HttpGet("ScoringAlgorithms")]
        public async Task<ScoringAlgorithmResponse> GetScoringAlgorithms()
        {
            return await Orchestrator.GetOBDScoringAlgorithms();
        }

    }
}
