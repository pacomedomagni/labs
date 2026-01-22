using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Api.Controllers.SupportService;
using Progressive.Telematics.Labs.Business.Orchestrators.UserManagement;
using Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;

namespace Progressive.Telematics.Labs.Api.Controllers.UserManagement
{
    [ApiController]
    [Route("api/UserManagement/[controller]")]
    [Produces("application/json")]
    public class AddNewAccountController : SupportController<IAddNewAccountOrchestrator>
    {
        [HttpPost]
        public async Task<AddAccountResponse> AddNewAccount([FromBody] AddAccountRequest request)
        {
            return await Orchestrator.AddNewAccount(request);
        }
    }
}
