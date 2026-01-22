using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Api.Controllers.SupportService;
using Progressive.Telematics.Labs.Business.Orchestrators.CustomerSearch;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Business.Orchestrators.UserManagement;
using Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;

namespace Progressive.Telematics.Labs.Api.Controllers.UserManagement
{
    [ApiController]
    [Route("api/UserManagement/[controller]")]
    [Produces("application/json")]
    public class ValidateNewCustomerController : SupportController<ILabsUserManagementOrchestrator>
    {
        [HttpPost]
        public async Task<ContactDetailsModel> ValidateNewCustomer([FromBody] ValidateNewCustomerBody request)
        {
            return await Orchestrator.ValidateNewCustomer(request);
        }
    }
}
