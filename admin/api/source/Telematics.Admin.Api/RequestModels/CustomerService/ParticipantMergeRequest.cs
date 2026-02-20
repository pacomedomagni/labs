using System;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class ParticipantMergeRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public short PolicySuffix { get; set; }

        [Required]
        public string DestParticipantId { get; set; }

        [Required]
        public string SrcParticipantId { get; set; }
    }
}
