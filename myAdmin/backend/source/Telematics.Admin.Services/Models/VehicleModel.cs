using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class VehicleModel
    {
        [JsonPropertyName("vehicle")]
        public string Vehicle { get; set; }

        [JsonPropertyName("vehicleAssigned")]
        public bool VehicleAssigned { get; set; }

        [JsonPropertyName("vehicleId")]
        public string VehicleId { get; set; }

        [JsonPropertyName("programType")]
        public string ProgramType { get; set; }
    }
}
