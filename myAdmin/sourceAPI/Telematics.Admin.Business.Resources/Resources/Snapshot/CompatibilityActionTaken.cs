using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class CompatibilityActionTaken : Resource
    {
        [JsonPropertyName("actionTakenXRefSeqId")]
        public int ActionTakenXRefSeqId { get; set; }

        [JsonPropertyName("compatibilitySeqId")]
        public int CompatibilitySeqId { get; set; }

        [JsonPropertyName("actionTakenCode")]
        public int ActionTakenCode { get; set; }

        [JsonPropertyName("createDateTime")]
        public DateTime CreateDateTime { get; set; }

        [JsonPropertyName("lastChangeUserId")]
        public string LastChangeUserId { get; set; }
    }
}
