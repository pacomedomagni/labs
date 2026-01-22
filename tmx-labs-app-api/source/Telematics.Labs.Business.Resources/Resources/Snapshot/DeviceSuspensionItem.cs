using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources;

[TsClass]
public class DeviceSuspensionItem : Resource
{
    [JsonPropertyName("deviceSerialNumber")]
    public string DeviceSerialNumber { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [JsonPropertyName("daysSuspended")]
    public string DaysSuspended { get; set; }

    [JsonPropertyName("userName")]
    public string UserName { get; set; }
}

