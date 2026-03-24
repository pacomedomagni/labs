using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class CompletedOrdersList : Resource
{
    public List<DeviceOrderInfo> Orders { get; set; } = new();
    public int TotalCount { get; set; }
    public List<ProcessedByUser> ProcessedByUsers { get; set; } = new();
}

public class ProcessedByUser
{
    public string UserID { get; set; }
    public string DisplayName { get; set; }
}
