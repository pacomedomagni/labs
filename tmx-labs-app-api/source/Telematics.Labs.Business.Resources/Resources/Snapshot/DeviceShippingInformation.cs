using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources;

[TsClass]
public class DeviceShippingInformation
{
    [JsonPropertyName("policyNumber")]
    public string PolicyNumber { get; set; }

    [JsonPropertyName("returnedDeviceCreateDate")]
    public DateTime? ReturnedDeviceCreateDate { get; set; }

    [JsonPropertyName("returnedDeviceReceivedDate")]
    public DateTime? ReturnedDeviceReceivedDate { get; set; }

    [JsonPropertyName("shipDateTime")]
    public DateTime? ShipDateTime { get; set; }
}

