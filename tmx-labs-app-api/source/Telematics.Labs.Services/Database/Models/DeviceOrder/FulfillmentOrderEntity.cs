using System;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;

/// <summary>
/// DAL entity representing fulfillment order data from database queries.
/// Maps to results from usp_FulfillmentOrder_SelectByStatus.
/// </summary>
/// <remarks>
/// Naming conventions for DAL models:
/// - *Entity: Direct table/view mapping
/// - *QueryResult: Complex query/join projections
/// - *Params: Stored procedure input parameters
/// </remarks>
public class FulfillmentOrderEntity
{
    public int DeviceOrderSeqID { get; set; }
    public DateTime CreateDateTime { get; set; }
    public int DeviceOrderStatusCode { get; set; }
    public string StatusDescription { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public string ParticipantGroupExternalKey { get; set; }
    public DateTime? ShipDateTime { get; set; }
    public DateTime? ProcessedDateTime { get; set; }
    public string FulfilledByUserID { get; set; }
    public int DeviceDetailCount { get; set; }
    public string DeviceSerialNumbers { get; set; }
    public string XirgoVersionDescriptions { get; set; }
    public string SnapshotVersionCode { get; set; }
}
