using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Shared.Configs
{
    public class ServicesConfig
    {
        public ApiConfig ClaimsParticipantManagementApi { get; set; }
        public ApiConfig CommonApi { get; set; }
        public ApiConfig DeviceApi { get; set; }
        public ApiConfig HomebaseParticipantManagementApi { get; set; }
        public ApiConfig TmxPolicyApi { get; set; }
        public ApiConfig PolicyApi { get; set; }
        public ApiConfig PolicyDeviceApi { get; set; }
        public ApiConfig PolicyTripApi { get; set; }
        public ApiConfig TrialApi { get; set; }
        public ApiConfig UbiApi { get; set; }
        public ApiConfig FloowApi { get; set; }
        public ApiGatewayConfig PolicyServicingApi { get; set; }
        public Dictionary<string, string> WcfServices { get; set; }
    }

    public class ApiConfig
    {
        public string BaseUrl { get; set; }
        public Dictionary<string, string> Endpoints { get; set; }
    }

    public class ApiGatewayConfig : ApiConfig
    {
        public string ApiKey { get; set; }
    }
}

