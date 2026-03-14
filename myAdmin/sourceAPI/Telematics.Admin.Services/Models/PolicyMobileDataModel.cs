using System;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class PolicyMobileDataModel
    {
        [JsonPropertyName("groupExternalId")]
        public string GroupExternalId { get; set; }

        [JsonPropertyName("policyPeriodSeqId")]
        public int PolicyPeriodSeqId { get; set; }

        [JsonPropertyName("policySeqId")]
        public int PolicySeqId { get; set; }

        [JsonPropertyName("participantSeqId")]
        public int ParticipantSeqId { get; set; }

        [JsonPropertyName("homeBaseDeviceSeqId")]
        public int? HomeBaseDeviceSeqId { get; set; }

        [JsonPropertyName("participantExternalId")]
        public string ParticipantExternalId { get; set; }

        [JsonPropertyName("programType")]
        public string ProgramType { get; set; }

        [JsonPropertyName("driverSeqId")]
        public int? DriverSeqId { get; set; }

        [JsonPropertyName("driverExternalId")]
        public string DriverExternalId { get; set; }

        [JsonPropertyName("driverFirstName")]
        public string DriverFirstName { get; set; }

        [JsonPropertyName("deviceSeqId")]
        public int? DeviceSeqId { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("reasonCode")]
        public short ReasonCode { get; set; }

        [JsonPropertyName("deviceExperienceTypeCode")]
        public int DeviceExperienceTypeCode { get; set; }

        [JsonPropertyName("vehicleSeqId")]
        public int? VehicleSeqId { get; set; }

        [JsonPropertyName("vin")]
        public string VIN { get; set; }

        [JsonPropertyName("modelYear")]
        public short? ModelYear { get; set; }

        [JsonPropertyName("make")]
        public string Make { get; set; }

        [JsonPropertyName("model")]
        public string Model { get; set; }

        [JsonPropertyName("vehicleExternalId")]
        public string VehicleExternalId { get; set; }

        [JsonPropertyName("mobileSummarizerVersionCode")]
        public int? MobileSummarizerVersionCode { get; set; }

        [JsonPropertyName("nonInstallerOptOutDateTime")]
        public DateTime? NonInstallerOptOutDateTime { get; set; }

        [JsonPropertyName("inceptionDate")]
        public DateTime InceptionDate { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("policySuffix")]
        public short PolicySuffix { get; set; }

        [JsonPropertyName("expirationDate")]
        public DateTime ExpirationDate { get; set; }

        [JsonPropertyName("mobileSummarizerCode")]
        public int MobileSummarizerCode { get; set; }

        [JsonPropertyName("ratedDistractedDrivingInd")]
        public bool RatedDistractedDrivingInd { get; set; }
    }
}
