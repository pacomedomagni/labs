using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class CompatibilityItem : Resource
    {
        [JsonPropertyName("compatibilitySeqId")]
        public int CompatibilitySeqId { get; set; }

        [JsonPropertyName("programCode")]
        public ProgramCode ProgramCode { get; set; }

        [JsonPropertyName("compatibilityTypeCode")]
        public int CompatibilityTypeCode { get; set; }

        [JsonPropertyName("deviceExperienceTypeCode")]
        public DeviceExperience DeviceExperienceTypeCode { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("participantSeqId")]
        public int ParticipantSeqId { get; set; }

        [JsonPropertyName("deviceSerialNumber")]
        public string? DeviceSerialNumber { get; set; }

        [JsonPropertyName("vehicleModelYear")]
        public short? VehicleModelYear { get; set; }

        [JsonPropertyName("vehicleMake")]
        public string? VehicleMake { get; set; }

        [JsonPropertyName("vehicleModel")]
        public string? VehicleModel { get; set; }

        [JsonPropertyName("mobileDeviceId")]
        public string? MobileDeviceId { get; set; }

        [JsonPropertyName("mobileDeviceModelName")]
        public string? MobileDeviceModelName { get; set; }

        [JsonPropertyName("mobileOSName")]
        public string? MobileOSName { get; set; }

        [JsonPropertyName("emailAddress")]
        public string? EmailAddress { get; set; }

        [JsonPropertyName("detailedDescription")]
        public string DetailedDescription { get; set; }

        [JsonPropertyName("nonIssueFlag")]
        public bool NonIssueFlag { get; set; }

        [JsonPropertyName("createDateTime")]
        public DateTime CreateDateTime { get; set; }

        [JsonPropertyName("lastChangeDateTime")]
        public DateTime LastChangeDateTime { get; set; }

        [JsonPropertyName("lastChangeUserId")]
        public string LastChangeUserId { get; set; }

        [JsonPropertyName("compatibilityActionTakenXRef")]
        public List<CompatibilityActionTaken> CompatibilityActionTakenXRef { get; set; }


    }
}
