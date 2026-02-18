using System;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class BenchTestBoardDataModel
    {
        public int BoardID { get; set; }
        public string Name { get; set; }
        public int? LocationCode { get; set; }
        public int? StatusCode { get; set; }
        public string UserID { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public int DeviceCount { get; set; }
    }
}
