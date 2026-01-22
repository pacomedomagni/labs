using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Api.Controllers.SupportService;
using Progressive.Telematics.Labs.Business.Orchestrators.CustomerSearch;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.Search
{
    public class CustomerSearchController : SupportController<ICustomerSearchOrchestrator>
    {
        [HttpGet("getCustomersBySearchRequest")]
        public async Task<CustomerSearchResponse> GetCustomersBySearch([Required]string id)
        {
            return await Orchestrator.GetCustomersBySearch(id);
        }

        [HttpGet("getCustomersByDeviceSearchRequest")]
        public async Task<GetCustsByDevSearchResponse> GetCustomersByDeviceSearch([Required] string deviceId)
        {
            return await Orchestrator.GetCustomersByDeviceSearch(deviceId);
        }
    }
}
