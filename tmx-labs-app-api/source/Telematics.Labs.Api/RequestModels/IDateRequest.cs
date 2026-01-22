using System;

namespace Progressive.Telematics.Labs.Api.RequestModels
{
    public interface IDateRequest
    {
        DateTime StartDate { get; set; }
        DateTime EndDate { get; set; }
    }
}

