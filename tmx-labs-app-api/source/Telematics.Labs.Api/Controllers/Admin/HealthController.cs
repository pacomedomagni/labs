using Microsoft.AspNetCore.Mvc;

namespace Progressive.Telematics.Labs.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public ActionResult<string> Ping()
        {
            return Ok("Api is operational");
        }

        [HttpGet("/healthz")]
        public IActionResult HealthProbe()
        {
            return Ok("Heath Probe is Active");
        }
    }
}

