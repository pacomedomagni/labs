namespace Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest
{
    public class BenchTestItemList
    {
        public string DeviceSerialNumber { get; set; }
        public int? FirmwareSetCode { get; set; }
        public int LocationOnBoard { get; set; }
    }

    public class BenchTest
    {
        public int BoardID { get; set; }
        public string UserID { get; set; }
        public bool ForceUpdate { get; set; }
        public BenchTestItemList[] BenchTestItemList { get; set; }
    }

    public class AddBenchTestRequest
    {
        public BenchTest BenchTest { get; set; }
    }

    public class StopBenchTestRequest
    {
        public int BoardId { get; set; }
    }

    public class ClearBenchTestRequest
    {
        public int BoardId { get; set; }
    }

    public class StopIfCompleteBenchTestRequest
    {
        public int BoardId { get; set; }
    }

    public class StopIfCompleteBenchTestResponse : Resource
    {
        public bool IsStopped { get; set; }
    }
}
