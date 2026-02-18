using System;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest
{
    public class BenchTestBoardDeviceCollectionResponse : Resource
    {
        public BenchTestBoardDevice[] Devices { get; set; }
        public int ResultCount { get; set; }
    }

    public class BenchTestBoardDevice
    {
        public string DeviceSerialNumber { get; set; }
        public int? DeviceLocationOnBoard { get; set; }
    }

    public class AddDeviceToBoardRequest
    {
        public int BoardId { get; set; }
        public BenchTestBoardDevice Device { get; set; }
    }

    public class AddDeviceToBoardResponse : Resource
    {
    }

    public class DeleteDeviceFromBoardRequest
    {
        public int BoardId { get; set; }
        public int LocationOnBoard { get; set; }
    }

    public class DeleteDeviceFromBoardResponse : Resource
    {
    }

    public class BenchTestBoardStatusResponse : Resource
    {
        public int BoardStatus { get; set; }
        public BenchTestBoardDeviceStatus[] DeviceStatuses { get; set; }
    }

    public class BenchTestBoardDeviceStatus
    {
        public int BoardID { get; set; }
        public string DeviceSerialNumber { get; set; }
        public int? BenchTestStatusCode { get; set; }
        public string Description { get; set; }
        public int? DisplayPercent { get; set; }
    }
}
