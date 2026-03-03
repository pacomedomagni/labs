using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ParticipantCalculatedValues : Resource
    {
        [JsonPropertyName("participantSeqId")]
        public int ParticipantSeqId { get; set; }

        [JsonPropertyName("ubiValue")]
        [TsProperty(Name = "ubiValue")]
        public double UBIValue { get; set; }

        [JsonPropertyName("ubiScore")]
        [TsProperty(Name = "ubiScore")]
        public double UBIScore { get; set; }

        [JsonPropertyName("connectedSeconds")]
        public int ConnectedSeconds { get; set; }

        [JsonPropertyName("connectedDays")]
        public int ConnectedDays { get { return ConnectedSeconds / Constants.SecondsInDay; } }

        [JsonPropertyName("disconnectedSeconds")]
        public int DisconnectedSeconds { get; set; }

        [JsonPropertyName("disconnectCount")]
        public int DisconnectCount { get; set; }

        [JsonPropertyName("scoringDetails")]
        public ParticipantScoringData ScoringDetails { get; set; }
    }
}
