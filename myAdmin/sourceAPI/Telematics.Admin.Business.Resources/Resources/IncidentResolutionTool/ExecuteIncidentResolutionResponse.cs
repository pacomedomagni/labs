using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Resources;

public class ExecuteIncidentResolutionResponse
{
    public List<IncidentResolutionDataModel> IncidentResolutions { get; set; }
    public List<ResponseError> ResponseErrors { get; set; }
    public ResponseStatus ResponseStatus { get; set; }
    public int Version { get; set; }
    public ExecuteIncidentResolutionResponse()
    {
        ResponseErrors = new List<ResponseError>();
        IncidentResolutions = new List<IncidentResolutionDataModel>();
    }
}


public enum ResponseStatus : int
{
    None = 0,
    Success = 1,
    Failure = 2,
    SuccessWithWarning = 3,
    FailureWithWarning = 4,
    PartialSuccess = 5,
}

public class ResponseError
{
    public string ErrorCode { get; set; }
    public string Field { get; set; }
    public string Message { get; set; }
    public ErrorSeverityCode SeverityCode { get; set; }
}

public enum ErrorSeverityCode : int
{
    None = 0,
    Warning = 1,
    Validation = 2,
    Error = 3,
    Exception = 4,
    Ticket = 5,
}

