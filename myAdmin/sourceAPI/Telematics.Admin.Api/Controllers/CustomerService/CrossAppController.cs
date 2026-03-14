using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    public class CrossAppController : CustomerServiceController<ICrossAppOrchestrator>
    {
        [HttpGet("enrolledFeatures/{policyNumber}")]
        public async Task<PolicyEnrolledFeatures> GetPolicyEnrolledFeatures([Required, StringLength(9)] string policyNumber)
        {
            return await Orchestrator.GetPolicyEnrolledFeatures(policyNumber);
        }
    }
}
