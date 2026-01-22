using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Labs.Api.Controllers.Tools
{
    [Route("api/tools/[controller]")]
    public class ToolsController<T> : TelematicsController<T> { }
}

