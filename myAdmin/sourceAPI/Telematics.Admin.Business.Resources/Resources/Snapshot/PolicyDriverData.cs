using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class PolicyDriverData : Resource
    {
        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("pjStatus")]
        public string PJStatus { get; set; }

        [JsonPropertyName("driverFirstName")]
        public string DriverFirstName { get; set; }

        [JsonPropertyName("driverLastName")]
        public string DriverLastName { get; set; }
    }
}
