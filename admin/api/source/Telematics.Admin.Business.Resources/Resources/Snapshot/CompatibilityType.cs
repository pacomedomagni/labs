using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class CompatibilityType : Resource
    {
        [JsonPropertyName("code")]
        public int Code { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("deviceExperienceTypeCode")]
        public DeviceExperience DeviceExperienceTypeCode { get; set; }

        [JsonPropertyName("orderByNumber")]
        public int OrderByNumber { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
