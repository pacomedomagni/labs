using System;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class OrderVehicle
{
    public int VehicleSeqID { get; set; }
    public string VIN { get; set; }
    public short Year { get; set; }
    public string Make { get; set; }
    public string Model { get; set; }
    public DateTime CreateDateTime { get; set; }
    public string VehicleExternalId { get; set; }
    public int DeviceOrderSeqId { get; set; }
    public int DeviceOrderDetailSeqId { get; set; }
    public int ParticipantSeqId { get; set; }
    public string DeviceSerialNumber { get; set; }
}
