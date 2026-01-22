using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Device;
public class DeviceOrderDetails
{
    public int DeviceOrderDetailSeqID { get; set; }
    public int DeviceOrderSeqID { get; set; }
    public int ParticipantSeqID { get; set; }
    public int VehicleSeqID { get; set; }
    public int DeviceSeqID { get; set; }
    public DateTime CreateDateTime { get; set; }
    public bool IsReplacementOrder { get; set; }

    public DeviceOrderStatus DeviceOrderStatus => (DeviceOrderStatus)DeviceOrderStatusCode;
    public int DeviceOrderStatusCode { get; set; }
}

public enum DeviceOrderStatus
{
    New = 1,
    DevicesAssigned = 2,
    Shipped = 3,
    Canceled = 4
}
