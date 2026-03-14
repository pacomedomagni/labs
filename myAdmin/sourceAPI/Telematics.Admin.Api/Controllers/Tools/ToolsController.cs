using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Admin.Api.Controllers.Tools
{
    [Route("api/tools/[controller]")]
    public class ToolsController<T> : TelematicsController<T> { }
}
