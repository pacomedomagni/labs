using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Resources.Snapshot;

[TsClass]
public class SnapshotMobileParticipant : Resource
{
    [JsonPropertyName("policyNumber")]
    public string PolicyNumber { get; set; }
    [JsonPropertyName("status")]
    public string Status { get; set; }
    [JsonPropertyName("driverFirstName")]
    public string DriverFirstName { get; set; }
    [JsonPropertyName("driverLastName")]
    public string DriverLastName { get; set; }
}
