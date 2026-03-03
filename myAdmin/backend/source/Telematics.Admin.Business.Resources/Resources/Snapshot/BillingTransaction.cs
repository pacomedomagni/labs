using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class BillingTransaction : Resource
    {
        [JsonPropertyName("amount")]
        public string Amount { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("deviceSeqId")]
        public int DeviceSeqId { get; set; }

        [JsonPropertyName("deviceSerialNumber")]
        public string DeviceSerialNumber { get; set; }
    }
}
