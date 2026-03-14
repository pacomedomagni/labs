using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ExcludedDateRange : Resource
    {
        [JsonPropertyName("rangeStart")]
        public DateTime RangeStart { get; set; }

        [JsonPropertyName("rangeEnd")]
        public DateTime RangeEnd { get; set; }

        [JsonPropertyName("lastChangeDateTime")]
        public DateTime LastChangeDateTime { get; set; }

        [JsonPropertyName("excludedDateRangeReasonCode")]
        public int ExcludedDateRangeReasonCode { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("modByUserId")]
        public string ModByUserId { get; set; }
    }
}
