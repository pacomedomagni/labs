using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class Communication : Resource
    {
        [JsonPropertyName("processedDate")]
        public DateTime ProcessedDate { get; set; }

        [JsonPropertyName("method")]
        public string Method { get; set; }

        [JsonPropertyName("campaign")]
        public string Campaign { get; set; }

        [JsonPropertyName("reason")]
        public string Reason { get; set; }

        [JsonPropertyName("deviceSerialNumber")]
        public string DeviceSerialNumber { get; set; }

        [JsonPropertyName("participantSeqId")]
        public int ParticipantSeqId { get; set; }
    }
}
