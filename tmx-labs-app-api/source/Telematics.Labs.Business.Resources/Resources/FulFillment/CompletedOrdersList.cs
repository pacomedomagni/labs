using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class CompletedOrdersList : Resource
{
    public List<CompletedDeviceOrder> Orders { get; set; } = new();
    public int TotalCount { get; set; }
    public List<ProcessedByUser> ProcessedByUsers { get; set; } = new();
}

public class ProcessedByUser
{
    public string UserID { get; set; }
    public string DisplayName { get; set; }
}
