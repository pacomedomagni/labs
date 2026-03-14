using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    [Route("Api/CustomerService/[controller]")]
    public class CustomerServiceController<T> : TelematicsController<T> { }
}
