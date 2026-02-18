using System;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class BenchTestBoardDeviceDataModel
    {
        public int BoardID { get; set; }
        public string DeviceSerialNumber { get; set; }
        public int? DeviceLocationOnBoard { get; set; }
        public DateTime CreateDateTime { get; set; }
    }
}
