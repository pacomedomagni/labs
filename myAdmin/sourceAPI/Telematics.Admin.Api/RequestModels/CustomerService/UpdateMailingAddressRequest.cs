using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateMailingAddressRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public string ContactName { get; set; }

        [Required]
        public string Address1 { get; set; }

        public string Address2 { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        public string State { get; set; }

        [Required, StringLength(5, MinimumLength = 5)]
        public string ZipCode { get; set; }
    }
}
