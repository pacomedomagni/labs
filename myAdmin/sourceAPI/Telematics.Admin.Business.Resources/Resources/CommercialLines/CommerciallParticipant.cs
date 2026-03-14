using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources;

[TsClass]
public class CommercialParticipant : Resource
{
    [JsonPropertyName("participantId")]
    public string ParticipantId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("policySeqID")]
    public string PolicySeqID { get; set; }

    [JsonPropertyName("changeDate")]
    public DateTime ChangeDate { get; set; }

    [JsonPropertyName("ymm")]
    public string YMM { get; set; }

    [JsonPropertyName("vin")]
    public string VIN { get; set; }

    [JsonPropertyName("deviceReportedVIN")]
    public string DeviceReportedVIN { get; set; }

    [JsonPropertyName("deviceStatus")]
    public int DeviceStatus { get; set; }

    [JsonPropertyName("deviceType")]
    public string deviceType { get; set; }

    [JsonPropertyName("serialNumber")]
    public string SerialNumber { get; set; }

    [JsonPropertyName("sim")]
    public string Sim { get; set; }

    [JsonPropertyName("enrolledDate")]
    public DateTime? EnrolledDate { get; set; }

    [JsonPropertyName("shipDate")]
    public DateTime? ShipDate { get; set; }

    [JsonPropertyName("firstContactDate")]
    public DateTime? FirstContactDate { get; set; }

    [JsonPropertyName("lastContactDate")]
    public DateTime? LastContactDate { get; set; }

    [JsonPropertyName("returnDate")]
    public DateTime? ReturnDate { get; set; }

    [JsonPropertyName("returnReason")]
    public string? ReturnReason { get; set; }

    [JsonPropertyName("abandonDate")]
    public DateTime? AbandonDate { get; set; }

    [JsonPropertyName("deviceLocation")]
    public int? DeviceLocation { get; set; }

    [JsonPropertyName("deviceSeqId")]
    public int? DeviceSeqId { get; set; }

    [JsonPropertyName("participantSeqId")]
    public int ParticipantSeqId { get; set; }

    [JsonPropertyName("isCommunicationAllowed")]
    public bool IsCommunicationAllowed { get; set; }

    [JsonPropertyName("vehicleSeqId")]
    public int VehicleSeqId { get; set; }

    [JsonPropertyName("orderId")]
    public int? DeviceOrderId { get; set; }

    [JsonPropertyName("cableType")]
    public string? CableType { get; set; }
}
