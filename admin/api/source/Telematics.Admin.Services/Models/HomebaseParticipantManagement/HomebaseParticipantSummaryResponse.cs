using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Services.Models
{
    [TsClass]
    public class HomebaseParticipantSummaryResponse
    {
        [JsonPropertyName("telematicsId")]
        public string TelematicsId { get; set; }

        [JsonPropertyName("driverReferenceId")]
        public string DriverReferenceId { get; set; }

        [JsonPropertyName("ubiEnrolled")]
        public bool UBIEnrolled { get; set; }

        [JsonPropertyName("ubiActivated")]
        public bool UBIActivated { get; set; }

        [JsonPropertyName("tmxMobileRegistered")]
        public bool TMXMobileRegistered { get; set; }

        [JsonPropertyName("adEnrolled")]
        public bool ADEnrolled { get; set; }

        [JsonPropertyName("adActivated")]
        public bool ADActivated { get; set; }

        [JsonPropertyName("cadExperience")]
        public bool? CADExperience { get; set; }

        [JsonPropertyName("ubiExperience")]
        public DeviceExperience? UBIExperience { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }
    }
}
