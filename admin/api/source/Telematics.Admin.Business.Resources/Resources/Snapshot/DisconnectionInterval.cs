using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class DisconnectionInterval : Resource
    {
        [JsonPropertyName("connection")]
        public DateTime? Connection { get; set; }

        [JsonPropertyName("disconnection")]
        public DateTime? Disconnection { get; set; }

        [JsonPropertyName("disconnectionDuration")]
        public string DisconnectionDuration
        {
            get
            {
                var span = (Connection - Disconnection);
                if (span.HasValue)
                {
                    string format;
                    if (span.Value.Days > 0)
                        format = "{0} days, {1} hours, {2} minutes";
                    else
                        format = "{1} hours, {2} minutes";

                    return string.Format(format, span.Value.Days, span.Value.Hours, span.Value.Minutes);
                }
                else
                    return "";
            }
        }
    }
}
