using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Labs.Api.Controllers.SupportService
{
    [Route("Api/SupportService/[controller]")]
    public class SupportController<T> : TelematicsController<T> { }
}

