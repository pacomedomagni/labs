using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Progressive.Telematics.Labs.Api.Controllers.Common
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientErrorLoggerController : ControllerBase
    {
        private readonly ILogger<ClientErrorLoggerController> logger;

        public ClientErrorLoggerController(ILogger<ClientErrorLoggerController> logger)
        {
            this.logger = logger;
        }

        [HttpPost]
        public void Post(ClientError error)
        {
            logger.LogError(new EventId(3000), "Client Error: {Message} {MessageDetail} {StackTrace}", error.Message, error.Detail, error.StackTrace);
        }
    }

    public class ClientError
    {
        public string Message { get; set; }
        public string StackTrace { get; set; }
        public string Detail { get; set; }
    }
}

