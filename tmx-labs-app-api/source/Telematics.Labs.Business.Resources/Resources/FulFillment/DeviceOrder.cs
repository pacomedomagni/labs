using System;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class DeviceOrder
{
    public int DeviceOrderSeqID { get; set; }
    public int NbrDevicesNeeded { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}
