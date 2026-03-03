using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class PolicyPeriod : Resource
    {
        [JsonPropertyName("createDate")]
        public DateTime? CreateDate { get; set; }

        [JsonPropertyName("expirationDate")]
        public DateTime? ExpirationDate { get; set; }

        [JsonPropertyName("groupExternalId")]
        public string GroupExternalId { get; set; }

        [JsonPropertyName("inceptionDate")]
        public DateTime? InceptionDate { get; set; }

        [JsonPropertyName("lastChangeDateTime")]
        public DateTime? LastChangeDateTime { get; set; }

        [JsonPropertyName("policyPeriodSeqId")]
        public int PolicyPeriodSeqId { get; set; }

        [JsonPropertyName("policySeqId")]
        public int PolicySeqId { get; set; }

        [JsonPropertyName("policySuffix")]
        public short PolicySuffix { get; set; }

        [JsonPropertyName("policySystem")]
        public string PolicySystem { get; set; }

        [JsonPropertyName("rateRevision")]
        public string RateRevision { get; set; }
    }
}
