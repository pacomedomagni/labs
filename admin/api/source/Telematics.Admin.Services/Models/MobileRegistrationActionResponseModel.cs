using System.Collections.Generic;
using System.Net;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class MobileRegistrationActionResponseModel
    {
        [JsonPropertyName("apiToken")]
        public string ApiToken { get; set; }

        [JsonPropertyName("mobileParticipantId")]
        public string MobileParticipantId { get; set; }

        [JsonPropertyName("vehicleList")]
        public IList<VehicleModel> VehicleList { get; set; }

        [JsonPropertyName("apiResponse")]
        public string ApiResponse { get; set; }

        [JsonPropertyName("statusCode")]
        public HttpStatusCode StatusCode { get; set; }
    }
}
