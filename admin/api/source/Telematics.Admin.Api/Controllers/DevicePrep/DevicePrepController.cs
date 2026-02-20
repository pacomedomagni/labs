using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Admin.Api.Controllers.DevicePrep
{
    [Route("api/devicePrep/[controller]")]
    public class DevicePrepController<T> : TelematicsController<T> { }
}
