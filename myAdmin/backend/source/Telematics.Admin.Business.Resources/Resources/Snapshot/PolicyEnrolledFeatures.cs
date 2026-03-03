using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class PolicyEnrolledFeatures : Resource
    {
        [JsonPropertyName("isEnrolledInAre")]
        public bool IsEnrolledInAre { get; set; }

        [JsonPropertyName("isEnrolledInSnapshot")]
        public bool IsEnrolledInSnapshot { get; set; }
    }
}
