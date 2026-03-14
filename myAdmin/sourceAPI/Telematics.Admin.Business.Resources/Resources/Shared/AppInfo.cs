using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class AppInfo : Resource
    {
        [JsonPropertyName("appName")]
        public string AppName { get; set; }

        [JsonPropertyName("assignmentExpirationDateTime")]
        public DateTime? AssignmentExpirationDateTime { get; set; }
    }
}
