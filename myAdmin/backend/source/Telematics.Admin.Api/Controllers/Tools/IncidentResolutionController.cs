using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.Tools.IncidentResolution;
using Progressive.Telematics.Admin.Business.Orchestrators.Tools;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.Controllers.Tools
{
    public class IncidentResolutionController : ToolsController<IIncidentResolutionOrchestrator>
    {
        [HttpGet]
        public async Task<List<IncidentResolutionDataModel>> Get()
        {
            return await Orchestrator.GetIncidentResolutions();
        }

        [HttpPut]
        public async Task Put(IncidentResolutionDataModel incidentResolution)
        {
            await Orchestrator.UpdateIncidentResolution(incidentResolution);
        }

        [HttpPost]
        public async Task Post(IncidentResolutionDataModel incidentResolution)
        {
            await Orchestrator.AddIncidentResolution(incidentResolution);
        }

        [HttpDelete]
        public async Task Delete(IncidentResolutionDataModel incidentResolution)
        {
            await Orchestrator.DeleteIncidentResolution(incidentResolution);
        }

        [HttpPost("execute")]
        public async Task<ExecuteIncidentResolutionResponse> Execute(ExecuteStoredProcedureRequest request)
        {
            return await Orchestrator.ExecuteStoredProcedure(request.IncidentResolution, request.StoredProcedureParameters);
        }

        [HttpGet("getStoredProcedureParameters/{storedProcedureName}")]
        public async Task<SPParameter[]> GetStoredProcedureParameters(string storedProcedureName)
        {
            return await Orchestrator.GetStoredProcedureParameters(storedProcedureName);
        }
    }
}
