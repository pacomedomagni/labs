namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class BenchTestBoardDeviceStatusDataModel
    {
        public int BoardID { get; set; }
        public string DeviceSerialNumber { get; set; }
        public int? BenchTestStatusCode { get; set; }
        public string Description { get; set; }
        public int? DisplayPercent { get; set; }
    }
}
