using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class OptOutSuspension : Resource
    {
        [JsonPropertyName("seqId")]
        public int SeqId { get; set; }

        [JsonPropertyName("startDate")]
        public DateTime StartDate { get; set; }

        [JsonPropertyName("endDate")]
        public DateTime EndDate { get; set; }

        [JsonPropertyName("isCancelled")]
        public bool IsCancelled { get; set; }

        [JsonPropertyName("isReturned")]
        public bool IsReturned { get; set; }

        [JsonPropertyName("reasonCode")]
        public OptOutReasonCode ReasonCode { get; set; }

        [JsonPropertyName("deviceSerialNumber")]
        public string DeviceSerialNumber { get; set; }

        [JsonPropertyName("deviceSeqId")]
        public int DeviceSeqId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; }
    }
}
