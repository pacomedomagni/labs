using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ParticipantScoringData : Resource
    {
        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("experience")]
        [Column("DeviceExperienceTypeCode")]
        public DeviceExperience Experience { get; set; }

        [JsonPropertyName("mobileSummarizerVersionCode")]
        public int? MobileSummarizerVersionCode { get; set; }

        [JsonPropertyName("monitoringCompleteConnectDays")]
        public short MonitoringCompleteConnectDays { get; set; }

        [JsonPropertyName("mobileCalculator")]
        [Column("MobileValueCalculatorCode")]
        public MobileValueCalculatorType MobileCalculator { get; set; }

        [JsonPropertyName("pluginCalculator")]
        [Column("OBD2ValueCalculatorCode")]
        public OBDValueCalculatorType PluginCalculator { get; set; }

        [JsonPropertyName("ratedDistractedDrivingInd")]
        public bool RatedDistractedDrivingInd { get; set; }
    }
}
