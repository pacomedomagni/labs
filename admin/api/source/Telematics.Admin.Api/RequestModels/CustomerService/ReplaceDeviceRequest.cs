using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class ReplaceDeviceRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public int ParticipantSeqId { get; set; }
    }
}
