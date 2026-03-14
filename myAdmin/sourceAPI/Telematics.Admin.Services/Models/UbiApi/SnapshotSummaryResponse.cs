using System.Collections.Generic;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Services.Models
{
    [TsClass]
    public class SnapshotSummaryResponse
    {
        [JsonPropertyName("participants")]
        public List<SnapshotParticipant> Participants { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }
    }
}
