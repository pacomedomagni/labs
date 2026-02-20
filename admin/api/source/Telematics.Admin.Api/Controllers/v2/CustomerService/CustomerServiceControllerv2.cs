using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Admin.Api.Controllers.v2.CustomerService
{
	[Route("Api/v2/CustomerService/[controller]")]
	public class CustomerServiceControllerv2<T> : TelematicsController<T> { }
}
