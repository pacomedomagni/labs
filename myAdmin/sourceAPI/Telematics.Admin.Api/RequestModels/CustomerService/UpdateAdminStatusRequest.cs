using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateAdminStatusRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }
        [Required]
        public string ParticipantID { get; set; }
        public string DeviceSerialNumber { get; set; }

	}
}