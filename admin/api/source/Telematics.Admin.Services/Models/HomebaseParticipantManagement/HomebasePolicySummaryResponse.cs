using System.Collections.Generic;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Services.Models
{
    [TsClass]
    public class HomebasePolicySummaryResponse
    {
        [JsonPropertyName("policy")]
        public string Policy { get; set; }

        [JsonPropertyName("participants")]
        public List<HomebaseParticipantSummaryResponse> Participants { get; set; }
    }
}
