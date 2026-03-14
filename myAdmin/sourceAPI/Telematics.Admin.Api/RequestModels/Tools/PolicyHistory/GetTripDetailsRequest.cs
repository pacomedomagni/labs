using System;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.Tools.PolicyHistory
{
    public class GetTripDetailsRequest
    {
        [Required]
        public long TripSeqId { get; set; }

        [Required]
        public DateTimeOffset Date { get; set; }

        [Required]
        public int Algorithm { get; set; }

        [Required]
        public DeviceExperience Experience { get; set; }
    }
}
