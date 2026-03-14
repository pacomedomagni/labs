using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class MobileDevice : Resource
    {
        [JsonPropertyName("deviceSeqId")]
        public int? DeviceSeqId { get; set; }

        [JsonPropertyName("homeBaseDeviceSeqId")]
        public int? HomeBaseDeviceSeqId { get; set; }

        [JsonPropertyName("deviceIdentifier")]
        public string DeviceIdentifier { get; set; }

        [JsonPropertyName("mobileDeviceAliasName")]
        public string MobileDeviceAliasName { get; set; }

        [JsonPropertyName("mobileOSName")]
        public string MobileOSName { get; set; }

        [JsonPropertyName("mobileOSVersionName")]
        public string MobileOSVersionName { get; set; }

        [JsonPropertyName("mobileDeviceModelName")]
        public string MobileDeviceModelName { get; set; }

        [JsonPropertyName("mobileAppVersionName")]
        public string MobileAppVersionName { get; set; }

        [JsonPropertyName("firstContactDateTime")]
        public DateTime? FirstContactDateTime { get; set; }

        [JsonPropertyName("lastContactDateTime")]
        public DateTime? LastContactDateTime { get; set; }

        [JsonPropertyName("lastUploadDateTime")]
        public DateTime? LastUploadDateTime { get; set; }

        [JsonPropertyName("isRegisteredInd")]
        public bool IsRegisteredInd { get; set; }

        [JsonPropertyName("mobileAppConfigId")]
        public int? MobileAppConfigId { get; set; }

        [JsonPropertyName("createDateTime")]
        public DateTime? CreateDateTime { get; set; }

        [JsonPropertyName("lastChangeDateTime")]
        public DateTime? LastChangeDateTime { get; set; }
    }
}
