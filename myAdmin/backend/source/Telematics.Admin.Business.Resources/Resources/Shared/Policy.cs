using System.Collections.Generic;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class Policy : Resource
    {
        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("transactionError")]
        public string TransactionError { get; set; }

        [JsonPropertyName("channelIndicator")]
        public string ChannelIndicator { get; set; }

        [JsonPropertyName("policyPeriodDetails")]
        public List<PolicyPeriod> PolicyPeriodDetails { get; set; }

        [JsonPropertyName("areDetails")]
        public ArePolicyDetails AreDetails { get; set; }

        [JsonPropertyName("snapshotDetails")]
        public SnapshotPolicyDetails SnapshotDetails { get; set; }

        [JsonPropertyName("participants")]
        public List<Participant> Participants { get; set; }
    }
}
