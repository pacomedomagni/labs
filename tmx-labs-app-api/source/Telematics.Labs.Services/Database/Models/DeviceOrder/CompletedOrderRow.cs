using System;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;

public class CompletedOrderRow
{
    public int DeviceOrderSeqID { get; set; }
    public string ParticipantGroupExternalKey { get; set; }
    public DateTime? ProcessedDateTime { get; set; }
    public DateTime? ShipDateTime { get; set; }
    public string FulfilledByUserID { get; set; }
    public int DeviceCount { get; set; }
    public string DeviceSerialNumbers { get; set; }
}
