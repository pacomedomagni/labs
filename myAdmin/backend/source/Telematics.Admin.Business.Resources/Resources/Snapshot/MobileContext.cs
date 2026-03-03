using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class MobileContext : Resource
    {
        [JsonPropertyName("mobileDeviceContextOffSetDateTime")]
        public DateTimeOffset MobileDeviceContextOffSetDateTime { get; set; }

        [JsonPropertyName("backgroundAppRefreshInd")]
        public short BackgroundAppRefreshInd { get; set; }

        [JsonPropertyName("gpsLocationServicesInd")]
        [TsProperty(Name = "gpsLocationServicesInd")]
        public short GPSLocationServicesInd { get; set; }

        [JsonPropertyName("pushEnabledInd")]
        public short PushEnabledInd { get; set; }

        [JsonPropertyName("lowPowerModeInd")]
        public short LowPowerModeInd { get; set; }

        [JsonPropertyName("batteryLevelAmt")]
        public float BatteryLevelAmt { get; set; }

        [JsonPropertyName("gapText")]
        public string GapText { get; set; }
    }
}
