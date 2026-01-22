using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources;

[TsClass]
public class PluginDevice : Resource
{
    [JsonPropertyName("deviceSeqId")]
    public int? DeviceSeqId { get; set; }

    [JsonPropertyName("homeBaseDeviceSeqId")]
    public int? HomeBaseDeviceSeqId { get; set; }

    [JsonPropertyName("wirelessStatus")]
    public string WirelessStatus { get; set; }

    [JsonPropertyName("deviceSerialNumber")]
    public string DeviceSerialNumber { get; set; }

    [JsonPropertyName("pendingDeviceSerialNumber")]
    public string PendingDeviceSerialNumber { get; set; }

    [JsonPropertyName("sim")]
    [TsProperty(Name = "sim")]
    public string SIM { get; set; }

    [JsonPropertyName("deviceManufacturer")]
    public string DeviceManufacturer { get; set; }

    [JsonPropertyName("deviceReceivedDate")]
    public DateTime? DeviceReceivedDate { get; set; }

    [JsonPropertyName("shipDateTime")]
    public DateTime? ShipDateTime { get; set; }

    [JsonPropertyName("deviceAbandonedDate")]
    public DateTime? DeviceAbandonedDate { get; set; }

    [JsonPropertyName("lastRemoteResetDateTime")]
    public DateTime? LastRemoteResetDateTime { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("reportedVIN")]
    [TsProperty(Name = "reportedVIN")]
    public string ReportedVIN { get; set; }

    [JsonPropertyName("deviceVersion")]
    public string DeviceVersion { get; set; }

    [JsonPropertyName("location")]
    public string Location { get; set; }

    [JsonPropertyName("returnReasonCode")]
    public DeviceReturnReasonCode? ReturnReasonCode { get; set; }

    [JsonPropertyName("features")]
    public IList<DeviceFeature> Features { get; set; }

    [JsonPropertyName("firmwareDetails")]
    public DeviceFirmwareDetails FirmwareDetails { get; set; }

    [JsonPropertyName("history")]
    public DeviceHistory History { get; set; }

}

