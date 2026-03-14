using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class ClaimsPolicySummaryResponse
    {
        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("participantSummaries")]
        public List<ClaimsParticipantSummaryResponse> ParticipantSummaries { get; set; }
    }
}
