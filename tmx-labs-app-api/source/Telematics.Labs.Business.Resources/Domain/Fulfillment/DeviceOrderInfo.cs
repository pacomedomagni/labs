using System;
using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

namespace Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

/// <summary>
/// Domain model representing a device order in the fulfillment context.
/// </summary>
public class DeviceOrderInfo
{
    public int DeviceOrderSeqID { get; set; }
    public string OrderNumber { get; set; }
    public string LastName { get; set; }
    public string FirstName { get; set; }
    public string Email { get; set; }
    public string AddressLine1 { get; set; }
    public string AddressLine2 { get; set; }
    public string City { get; set; }
    public string ZipCode { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public DateTime? ProcessedDateTime { get; set; }
    public string ProcessedBy { get; set; }
    public string ProcessedByUserID { get; set; }
    public DateTime? ShipDateTime { get; set; }
    public DateTime OrderDate { get; set; }
    public bool HasErrors { get; set; }
    public string State { get; set; }
    public string DeviceType { get; set; }
    public string SnapshotVersion { get; set; }
    public int DeviceCount { get; set; }
    public List<DeviceType> DeviceTypes { get; set; }
    public List<string> DeviceSerialNumbers { get; set; } = new();
    public List<OrderVehicle> Vehicles { get; set; }
    public IEnumerable<string> MobileOSNames { get; set; }
    public string DeviceOrderStatusDescription { get; set; }

    public DeviceOrderInfo()
    {
        Vehicles = new List<OrderVehicle>();
        DeviceTypes = new List<DeviceType>();
    }
}
