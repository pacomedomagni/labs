using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class Participant : Resource
    {
        [JsonPropertyName("telematicsId")]
        public string TelematicsId { get; set; }

        [JsonPropertyName("areDetails")]
        public AreParticipantDetails AreDetails { get; set; }

        [JsonPropertyName("snapshotDetails")]
        public SnapshotParticipantDetails SnapshotDetails { get; set; }

        [JsonPropertyName("pluginDeviceDetails")]
        public PluginDevice PluginDeviceDetails { get; set; }

        [JsonPropertyName("mobileDeviceDetails")]
        public MobileDevice MobileDeviceDetails { get; set; }

        [JsonPropertyName("registrationDetails")]
        public Registration RegistrationDetails { get; set; }

        [JsonPropertyName("ubiFeatureActivationDateTime")]
        public DateTime? UBIFeatureActivationDateTime { get; set; }
    }
}
