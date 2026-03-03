using System;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class MobileReEnrollRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required, MinLength(10), MaxLength(10)]
        public string MobileId { get; set; }

        [Required]
        public string ParticipantId { get; set; }
    }
}
