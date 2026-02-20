using System;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Api.Attributes;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class OptOutSuspensionRequest : IDateRequest
    {
        [Required]
        public int ParticipantSeqId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required, EndDateMustBeGreaterThanStartDate]
        public DateTime EndDate { get; set; }

        [Required]
        public OptOutReasonCode ReasonCode { get; set; }

        [Required]
        public int DeviceSeqId { get; set; }
    }
}
