using System;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder
{
    public class CreateReplacementDeviceOrderModel
    {
        public int ParticipantGroupSeqId { get; set; }
        public int ParticipantSeqId { get; set; }
        public int VehicleSeqId { get; set; }
        public int? DeviceSeqId { get; set; }
        public string Vin { get; set; }
        public short? Year { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
    }

    public class DeviceOrderCreationResult
    {
        public int DeviceOrderSeqId { get; set; }
        public int[] DeviceOrderDetailSeqIds { get; set; } = Array.Empty<int>();
    }
}
