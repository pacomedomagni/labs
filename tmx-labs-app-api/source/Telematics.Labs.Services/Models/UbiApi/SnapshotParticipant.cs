using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Services.Models
{
    [TsClass]
    public class SnapshotParticipant
    {
        [JsonPropertyName("participantExternalId")]
        public string ParticipantExternalId { get; set; }

        [JsonPropertyName("participantId")]
        public string ParticipantId { get; set; }

        [JsonPropertyName("ubiEnrolled")]
        public bool UBIEnrolled { get; set; }

        [JsonPropertyName("ubiActivated")]
        public bool UBIActivated { get; set; }

        [JsonPropertyName("mobileRegistered")]
        public bool MobileRegistered { get; set; }

        [JsonPropertyName("deviceExperienceType")]
        public DeviceExperience? DeviceExperienceType { get; set; }

        [JsonPropertyName("cadExperience")]
        public bool? CADExperience { get; set; }

        [JsonPropertyName("adEnrolled")]
        public bool ADEnrolled { get; set; }

        [JsonPropertyName("adActivated")]
        public bool ADActivated { get; set; }

        [JsonPropertyName("ubiFeatureActivationDateTime")]
        public DateTime? UBIFeatureActivationDateTime { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("driverFirstname")]
        public string DriverFirstName { get; set; }

        [JsonPropertyName("driverLastName")]
        public string DriverLastName { get; set; }

        [JsonPropertyName("vehicleMake")]
        public string VehicleMake { get; set; }

        [JsonPropertyName("vehicleModel")]
        public string VehicleModel { get; set; }

        [JsonPropertyName("vehicleYear")]
        public int VehicleYear { get; set; }

        [JsonPropertyName("programModel")]
        public string ProgramModel { get; set; }

        [JsonPropertyName("snapshotVersion")]
        public string SnapshotVersion { get; set; }

        [JsonPropertyName("mobileRegistrationCode")]
        public string MobileRegistrationCode { get; set; }


    }
}

