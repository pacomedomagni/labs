using Progressive.Telematics.Admin.Business.Resources.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class AreUnenrollRequest
    {
        [Required]
        public string TelematicsId { get; set; }

        [Required]
        public string UnenrollReason { get; set; }
    }
}
