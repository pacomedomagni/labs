using System.Collections.Generic;
using System.Text.Json.Serialization;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources
{
    [TsClass]
    public class DeviceHistory : Resource
    {
        [JsonPropertyName("recoveryInfo")]
        public IEnumerable<DeviceRecoveryItem> RecoveryInfo { get; set; }

        [JsonPropertyName("suspensionInfo")]
        public IEnumerable<DeviceSuspensionItem> SuspensionInfo { get; set; }

        [JsonPropertyName("shippingInfo")]
        public IEnumerable<DeviceShippingInformation> ShippingInfo { get; set; }
    }

}

