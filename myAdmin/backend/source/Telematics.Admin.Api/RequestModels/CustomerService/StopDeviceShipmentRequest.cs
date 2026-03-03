using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class StopDeviceShipmentRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public int ParticipantSeqId { get; set; }

        [Required]
        public int PolicyPeriodSeqId { get; set; }

        [Required]
        public StopShipmentMethod StopShipmentMethod { get; set; }
    }
}
