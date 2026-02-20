using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.Resources.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ParticipantJunction : Resource
    {
        [JsonPropertyName("systemName")]
        public string SystemName { get; set; }

        [JsonPropertyName("participantSeqID")]
        public int ParticipantSeqID { get; set; }

        [JsonPropertyName("participantID")]
        public Guid? ParticipantID { get; set; }

        [JsonPropertyName("participantExternalID")]
        public Guid? ParticipantExternalID { get; set; }

        [JsonPropertyName("deviceExperienceTypeCode")]
        public DeviceExperience? DeviceExperienceTypeCode { get; set; }

        [JsonPropertyName("mobileDeviceAliasName")]
        public string MobileDeviceAliasName { get; set; }

        [JsonPropertyName("policyPeriodSeqID")]
        public int PolicyPeriodSeqID { get; set; }

        [JsonPropertyName("policySuffix")]
        public int PolicySuffix { get; set; }

        [JsonPropertyName("expirationYear")]
        public int ExpirationYear { get; set; }

        [JsonPropertyName("inceptionDate")]
        public DateTime InceptionDate { get; set; }

        [JsonPropertyName("expirationDate")]
        public DateTime ExpirationDate { get; set; }

        [JsonPropertyName("rateRevision")]
        public string RateRevision { get; set; }

        [JsonPropertyName("vehicleSeqID")]
        public int? VehicleSeqID { get; set; }

        [JsonPropertyName("ymm")]
        [TsProperty(Name = "ymm")]
        public string YMM { get; set; }

        [JsonPropertyName("vin")]
        [TsProperty(Name = "vin")]
        public string VIN { get; set; }

        [JsonPropertyName("deviceSeqID")]
        public int? DeviceSeqID { get; set; }

        [JsonPropertyName("deviceSerialNumber")]
        public string DeviceSerialNumber { get; set; }

        [JsonPropertyName("homeBaseDeviceSeqID")]
        public int? HomeBaseDeviceSeqID { get; set; }

        [JsonPropertyName("pendingDeviceSerialNumber")]
        public string PendingDeviceSerialNumber { get; set; }

        [JsonPropertyName("junctionVersion")]
        public int JunctionVersion { get; set; }

        [JsonPropertyName("junctionVersionSeq")]
        public int JunctionVersionSeq { get; set; }

        [JsonPropertyName("changeEffectiveDate")]
        public DateTime ChangeEffectiveDate { get; set; }

        [JsonPropertyName("status")]
        public ParticipantStatus Status { get; set; }

        [JsonPropertyName("reasonCode")]
        public ParticipantReasonCode ReasonCode { get; set; }

        [JsonPropertyName("scoringAlgorithmCode")]
        public int? ScoringAlgorithmCode { get; set; }

        [JsonPropertyName("scoringAlgorithmData")]
        public ScoringAlgorithmData ScoringAlgorithmData { get; set; }

        [JsonPropertyName("driverSeqID")]
        public int? DriverSeqID { get; set; }
    }
}
