using System;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder
{
    public class PendingOrderSummaryRow
    {
        public int DeviceOrderSeqID { get; set; }
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public string State { get; set; }
        public int NbrDevicesNeeded { get; set; }
        public string DeviceType { get; set; }
        public int DeviceOrderStatusCode { get; set; }
        public string SnapshotVersion { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
