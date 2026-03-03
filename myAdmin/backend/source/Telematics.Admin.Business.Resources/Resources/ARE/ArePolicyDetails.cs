using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ArePolicyDetails : Resource
    {
        [JsonPropertyName("experienceType")]
        public AreExperience ExperienceType { get; set; }
    }
}
