using System;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn;

public class DeviceReturnByDeviceModel
{
    public int DeviceSeqID { get; set; }
    public int? DeviceReturnReasonCode { get; set; }
    public DateTime? DeviceReceivedDateTime { get; set; }
    public DateTime? DeviceAbandonedDateTime { get; set; }
}
