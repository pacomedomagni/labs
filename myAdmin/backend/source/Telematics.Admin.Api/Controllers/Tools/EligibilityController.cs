using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels;
using Progressive.Telematics.Admin.Api.RequestModels.Tools.Eligibility;
using Progressive.Telematics.Admin.Business.Orchestrators.Tools;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using WcfEligibleZipCodesService;
using WcfIneligibleVehiclesService;

namespace Progressive.Telematics.Admin.Api.Controllers.Tools
{
    public class EligibilityController : ToolsController<IEligibilityOrchestrator>
    {
        [HttpGet("eligibleZipCodes")]
        public async Task<IEnumerable<EligibleZipCode>> GetEligibleZipCodes(States? state, [StringLength(5, MinimumLength = 5)] string zipCode = "")
        {
            return await Orchestrator.GetEligibleZipCodes(state, zipCode);
        }

        [HttpPost("ineligibleVehicles")]
        public async Task<IEnumerable<IneligibleVehicle>> GetIneligibleVehicles(IneligibileVehiclesRequest request, [FromQuery] QueryParameters parms)
        {
            var data = await Orchestrator.GetIneligibleVehicles(request.VehicleYear, request.VehicleMake, request.VehicleModel, parms.Page, parms.PageSize);
            AddPaginationHeader(data);
            return data;
        }
    }
}
