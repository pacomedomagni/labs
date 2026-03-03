using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class Vehicle : Resource
    {
        [JsonPropertyName("year")]
        public int Year { get; set; }

        [JsonPropertyName("make")]
        public string Make { get; set; }

        [JsonPropertyName("model")]
        public string Model { get; set; }

        [JsonPropertyName("vin")]
        [TsProperty(Name = "vin")]
        public string VIN { get; set; }

        [JsonPropertyName("vehicleExternalId")]
        public string VehicleExternalId { get; set; }
    }
}
