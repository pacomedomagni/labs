using System;
using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class AllOrdersList : Resource
{
    public List<DeviceOrderInfo> Orders { get; set; } = new();
    public int TotalCount { get; set; }
}
