namespace Progressive.Telematics.Admin.Api.RequestModels.Tools.Eligibility
{
    public class IneligibileVehiclesRequest
    {
        public string DeviceDescription { get; set; }
        public string VehicleYear { get; set; }
        public string VehicleMake { get; set; }
        public string VehicleModel { get; set; }
        public bool? ExactModelMatch { get; set; }
    }
}
