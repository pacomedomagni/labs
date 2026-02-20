using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class ClaimsParticipantSummaryResponse
    {
        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("telematicsId")]
        public string TelematicsId { get; set; }

        [JsonPropertyName("isAccidentResponseEnrolled")]
        public bool IsAccidentResponseEnrolled { get; set; }

        [JsonPropertyName("isAccidentResponseActivated")]
        public bool IsAccidentResponseActivated { get; set; }

        [JsonPropertyName("driverReferenceId")]
        public string DriverReferenceId { get; set; }

        [JsonPropertyName("accidentResponseActivationDateTime")]
        public DateTime? AccidentResponseActivationDateTime { get; set; }

        [JsonPropertyName("enrollmentDateTime")]
        public DateTime EnrollmentDateTime { get; set; }

        [JsonPropertyName("accidentResponseConsentDateTime")]
        public DateTime? AccidentResponseConsentDateTime { get; set; }

        [JsonPropertyName("lastContactDateTime")]
        public DateTime? LastContactDateTime { get; set; }

        [JsonPropertyName("unenrollReason")]
        public UnenrollReason? UnenrollReason { get; set; }

        [JsonPropertyName("unenrollmentDateTime")]
        public DateTime? UnenrollmentDateTime { get; set; }
    }
}
