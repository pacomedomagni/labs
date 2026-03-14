using System;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Api.Attributes;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateEnrollmentDateRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public int ParticipantSeqId { get; set; }

        [Required, DateCannotBeLaterThanToday]
        public DateTime NewEnrollmentDate { get; set; }
    }

    public class UpdateEnrollmentDate20Request : UpdateEnrollmentDateRequest
    {
        [Required]
        public bool ShouldRecalculateScore { get; set; }

        public DateTime? EndorsementAppliedDate { get; set; }
    }
}
