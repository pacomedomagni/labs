
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Api.Controllers.SupportService;
using Progressive.Telematics.Labs.Business.Orchestrators.Customer;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;



namespace Progressive.Telematics.Labs.Api.Controllers.Customer
{
    public class UpdateCustomerController : SupportController<IUpdateCustomerOrchestrator>
    {
        [HttpPut("updateCustomer")]
        public async Task<UpdateCustomerResponse> UpdateCustomers([Required] UpdateCustomerRequest request)
        {
            return await Orchestrator.UpdateCustomer(request);
        }
    }
}



