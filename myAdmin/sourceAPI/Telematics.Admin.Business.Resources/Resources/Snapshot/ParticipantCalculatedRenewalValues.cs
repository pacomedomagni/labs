using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ParticipantCalculatedRenewalValues : Resource
    {
        [JsonPropertyName("startDate")]
        public DateTime StartDate { get; set; }

        [JsonPropertyName("endDate")]
        public DateTime EndDate { get; set; }

        [JsonPropertyName("calculatorMessage")]
        public string CalculatorMessage { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }

        [JsonPropertyName("eligibilityIndicator")]
        public string EligibilityIndicator { get; set; }

        [JsonPropertyName("connectedSeconds")]
        public int ConnectedSeconds { get; set; }

        [JsonPropertyName("connectedDays")]
        public int ConnectedDays { get { return ConnectedSeconds / Constants.SecondsInDay; } }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("policySuffix")]
        public string PolicySuffix { get; set; }

        [JsonPropertyName("totalDisconnectEvents")]
        public int TotalDisconnectEvents { get; set; }

        [JsonPropertyName("ubiValue")]
        [TsProperty(Name = "ubiValue")]
        public string UBIValue { get; set; }

        [JsonPropertyName("ubiScore")]
        [TsProperty(Name = "ubiScore")]
        public string UBIScore { get; set; }
    }
}
