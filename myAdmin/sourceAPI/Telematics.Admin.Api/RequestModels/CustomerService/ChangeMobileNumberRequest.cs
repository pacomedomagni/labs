using System;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class ChangeMobileNumberRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required, MinLength(10), MaxLength(10)]
        public string MobileId { get; set; }

        [Required]
        public int RegistrationSeqId { get; set; }

        [Required]
        public ParticipantStatus ParticipantStatus { get; set; }

        [Required]
        public ParticipantReasonCode ParticipantReasonCode { get; set; }

        [Required]
        public OptOutReasonCode OptOutReasonCode { get; set; }

        public DateTime? OptOutDate { get; set; }

        public bool OverrideRegistrations { get; set; } = false;

        public int[] sequenceIdsOfConflictingRoadTestLabsParticipants { get; set; }
    }
}
