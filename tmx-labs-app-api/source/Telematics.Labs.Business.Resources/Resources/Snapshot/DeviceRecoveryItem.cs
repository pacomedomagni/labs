using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources
{
    [TsClass]
    public class DeviceRecoveryItem : Resource
    {
        [JsonPropertyName("deviceSeqId")]
        public int DeviceSeqId { get; set; }

        [JsonPropertyName("deviceSerialNumber")]
        public string DeviceSerialNumber { get; set; }

        [JsonPropertyName("isSuspended")]
        public bool IsSuspended { get; set; }

        [JsonPropertyName("isAbandoned")]
        public bool IsAbandoned { get; set; }

        [JsonPropertyName("returnRequestDate")]
        public DateTime ReturnRequestDate { get; set; }

        [JsonPropertyName("deviceReceivedDate")]
        public DateTime DeviceReceivedDate { get; set; }
    }
}

