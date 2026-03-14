using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateDeviceAudioRequest
    {
        [Required]
        public string DeviceSerialNumber { get; set; }

        [Required]
        public bool IsAudioEnabled { get; set; }
    }
}
