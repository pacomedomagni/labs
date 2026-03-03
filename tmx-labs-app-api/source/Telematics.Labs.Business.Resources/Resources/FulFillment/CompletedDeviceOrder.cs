using System;
using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class CompletedDeviceOrder
{
    public int DeviceOrderSeqID { get; set; }
    public string OrderNumber { get; set; }
    public DateTime? ProcessedDateTime { get; set; }
    public DateTime? ShipDateTime { get; set; }
    public string ProcessedBy { get; set; }
    public string ProcessedByUserID { get; set; }
    public string State { get; set; }
    public int DeviceCount { get; set; }
    public List<string> DeviceSerialNumbers { get; set; } = new();
}
