using System;

namespace Progressive.Telematics.Admin.Api.RequestModels
{
    public interface IDateRequest
    {
        DateTime StartDate { get; set; }
        DateTime EndDate { get; set; }
    }
}
