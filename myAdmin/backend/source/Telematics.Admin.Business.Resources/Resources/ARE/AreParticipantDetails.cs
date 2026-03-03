using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class AreParticipantDetails : Resource
    {
        [JsonPropertyName("driverFirstName")]
        public string DriverFirstName { get; set; }

        [JsonPropertyName("driverReferenceId")]
        public string DriverReferenceId { get; set; }

        [JsonPropertyName("enrollmentDateTime")]
        public DateTime? EnrollmentDateTime { get; set; }

        [JsonPropertyName("accidentResponseActivationDateTime")]
        public DateTime? AccidentResponseActivationDateTime { get; set; }

        [JsonPropertyName("accidentResponseConsentDateTime")]
        public DateTime? AccidentResponseConsentDateTime { get; set; }

        [JsonPropertyName("lastContactDateTime")]
        public DateTime? LastContactDateTime { get; set; }

        [JsonPropertyName("unenrollmentDateTime")]
        public DateTime? UnenrollmentDateTime { get; set; }

        [JsonPropertyName("unenrollReason")]
        public UnenrollReason? UnenrollReason { get; set; }

        [TsProperty(Name = "ubiEnrolled")]
        [JsonPropertyName("ubiEnrolled")]
        public bool UBIEnrolled { get; set; }

        [TsProperty(Name = "ubiActivated")]
        [JsonPropertyName("ubiActivated")]
        public bool UBIActivated { get; set; }

        [TsProperty(Name = "tmxMobileRegistered")]
        [JsonPropertyName("tmxMobileRegistered")]
        public bool TMXMobileRegistered { get; set; }

        [TsProperty(Name = "adEnrolled")]
        [JsonPropertyName("adEnrolled")]
        public bool ADEnrolled { get; set; }

        [TsProperty(Name = "adActivated")]
        [JsonPropertyName("adActivated")]
        public bool ADActivated { get; set; }

        [TsProperty(Name = "cadExperience")]
        [JsonPropertyName("cadExperience")]
        public bool? CADExperience { get; set; }
    }
}
