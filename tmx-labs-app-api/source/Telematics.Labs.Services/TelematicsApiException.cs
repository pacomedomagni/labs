using System;
using System.Net;
using Microsoft.Extensions.Logging;

namespace Progressive.Telematics.Labs.Services
{
    public class TelematicsApiException : Exception
    {
        public HttpStatusCode StatusCode { get; set; }
        public string StatusCodeDescription { get { return StatusCode.ToString(); } }
        public string DeveloperMessage { get; set; }
        public string DisplayMessage { get; set; }
        public string ErrorCode { get; set; }
        public ILogger Logger { get; private set; }

        public TelematicsApiException(ILogger logger) : this(logger, "") { }

        public TelematicsApiException(ILogger logger, string message) : this(logger, message, HttpStatusCode.InternalServerError) { }

        public TelematicsApiException(ILogger logger, string message, HttpStatusCode status) : base(message)
        {
            Logger = logger;
            StatusCode = status;
            DeveloperMessage = message;
        }

        public TelematicsApiException()
        {
        }
    }

    public class TelematicsApiExceptionModel
    {
        public string Message { get; set; }
        public string DeveloperMessage { get; set; }
        public string ErrorCode { get; set; }
    }
}

