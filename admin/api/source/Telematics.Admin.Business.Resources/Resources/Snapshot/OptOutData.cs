using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class OptOutData : Resource
    {
        [JsonPropertyName("date")]
        public DateTime? Date { get; set; }

        [JsonPropertyName("reason")]
        public OptOutReasonCode? Reason { get; set; }

        [JsonPropertyName("reasonDescription")]
        public string ReasonDescription { get; set; }
    }
}
