using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class FeeReversalRequest
    {
        [Required]
        public string DeviceSerialNumber { get; set; }

        [Required]
        public int ParticipantSeqID { get; set; }

        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        public short? ExpirationYear { get; set; }

        public short? PolicySuffix { get; set; }
    }
}
