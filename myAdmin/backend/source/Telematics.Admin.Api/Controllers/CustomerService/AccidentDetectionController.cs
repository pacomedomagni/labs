using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Api.RequestModels.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.AccidentDetection;
using System.Net;
using System.Threading.Tasks;
using System;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class AccidentDetectionController : CustomerServiceController<IAccidentDetectionOrchestrator>
    {
        [HttpPost("Unenroll")]
        [ProducesResponseType(typeof(UnenrollResponse.Success), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UnenrollResponse.Failure), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Unenroll(AreUnenrollRequest request)
        {
            var response = await Orchestrator.Unenroll(request.TelematicsId, request.UnenrollReason);
            return response switch
            {
                UnenrollResponse.Success success => Ok(),
                UnenrollResponse.Failure err => StatusCode(500, err),
                _ => throw new ArgumentOutOfRangeException()
            };
        }
    }
}
