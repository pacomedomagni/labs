using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Services.Models
{
    [TsClass]
    public class HomebaseParticipantMobileDeviceResponse
    {

        public string TelematicsId { get; set; }

        [JsonPropertyName("mobileAppVersionName")]
        public string MobileAppVersionName { get; set; }

        [JsonPropertyName("mobileDeviceId")]
        public string MobileDeviceId { get; set; }

        [JsonPropertyName("mobileDeviceModelName")]
        public string MobileDeviceModelName { get; set; }

        [JsonPropertyName("mobileOSName")]
        public string MobileOSName { get; set; }

        [JsonPropertyName("mobileOSVersionName")]
        public string MobileOSVersionName { get; set; }

    }
}
