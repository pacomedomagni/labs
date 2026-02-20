using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class ExcludedDateRangeReasonCodeModel
    {
        [JsonPropertyName("excludedDateRangeReasonCode")]
        public int ExcludedDateRangeReasonCode { get; set; }

        [JsonPropertyName("excludedDateRangeReasonDesc")]
        public string ExcludedDateRangeReasonDesc { get; set; }

        [JsonPropertyName("activeInd")]
        public bool ActiveInd { get; set; }
    }
}
