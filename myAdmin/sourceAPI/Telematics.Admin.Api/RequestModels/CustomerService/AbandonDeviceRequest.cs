using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class AbandonDeviceRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public int ParticipantSeqId { get; set; }

        [Required]
        public string DeviceSerialNumber { get; set; }

        public short? PolicySuffix { get; set; }

        public short? ExpirationYear { get; set; }
    }
}
