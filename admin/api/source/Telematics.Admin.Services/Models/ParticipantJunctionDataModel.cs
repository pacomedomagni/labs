using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class ParticipantJunctionDataModel
    {
        [JsonPropertyName("participantSequenceId")]
        public int ParticipantSequenceId { get; set; }

        [JsonPropertyName("junctionVersion")]
        public short JunctionVersion { get; set; }

        [JsonPropertyName("policyPeriodSequenceId")]
        public int PolicyPeriodSequenceId { get; set; }

        [JsonPropertyName("deviceSequenceId")]
        public int DeviceSequenceId { get; set; }

        [JsonPropertyName("qualifyingPeriodSequenceId")]
        public int QualifyingPeriodSequenceId { get; set; }
    }
}
