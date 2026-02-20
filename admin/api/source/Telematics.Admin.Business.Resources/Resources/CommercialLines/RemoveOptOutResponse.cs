using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Resources.Cl;

public class RemoveOptOutResponse
{
    public IEnumerable<DeviceOrderCreatedResponse> CreatedDeviceOrders { get; set; }
}

public class DeviceOrderCreatedResponse
{
    public int NewDeviceOrderId { get; set; }
    public int DeviceOrderDetailIds { get; set; }
}
