using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    public class WcfResponse
    {
        public ResponseStatus ResponseStatus { get; set; }
        public List<ResponseError> ResponseErrors { get; set; }
    }

    public class ResponseError : object
    {
        public string ErrorCode { get; set; }
        public string Field { get; set; }
        public string Message { get; set; }
        public ErrorSeverityCode SeverityCode { get; set; }
    }

    public enum ResponseStatus
    {
        Default = -1,
        None = 0,
        Success = 1,
        Failure = 2,
        SuccessWithWarning = 3,
        FailureWithWarning = 4,
        PartialSuccess = 5
    }

    public enum ErrorSeverityCode
    {
        None = 0,
        Warning = 1,
        Validation = 2,
        Error = 3,
        Exception = 4,
        Ticket = 5
    }
}

