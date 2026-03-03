using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ConnectionTimeline : Resource
    {
        [JsonPropertyName("isActiveParticipant")]
        public bool IsActiveParticipant { get; set; }

        [JsonPropertyName("eventPairs")]
        public IList<DisconnectionInterval> EventPairs { get; set; }

        [JsonPropertyName("connectedDuration")]
        public TimeSpan ConnectedDuration { get { return TotalMonitoringDuration; } }

        [JsonPropertyName("disconnectedDuration")]
        public TimeSpan DisconnectedDuration
        {
            get
            {
                if (EventPairs == null)
                    return new TimeSpan();
                else
                    return EventPairs.Aggregate(new TimeSpan(), (curr, next) =>
                    {
                        var diff = next.Connection - next.Disconnection;
                        if (diff.HasValue)
                            return curr + diff.Value;
                        else
                            return curr;
                    });
            }
        }

        [JsonPropertyName("totalMonitoringDuration")]
        public TimeSpan TotalMonitoringDuration { get; set; }

        [JsonPropertyName("connectedDurationFormatted")]
        public string ConnectedDurationFormatted
        {
            get { return formatTimeSpan(ConnectedDuration); }
        }

        [JsonPropertyName("disconnectedDurationFormatted")]
        public string DisconnectedDurationFormatted
        {
            get { return formatTimeSpan(DisconnectedDuration); }
        }

        [JsonPropertyName("totalMonitoringDurationFormatted")]
        public string TotalMonitoringDurationFormatted
        {
            get { return formatTimeSpan(TotalMonitoringDuration); }
        }

        string formatTimeSpan(TimeSpan ts)
        {
            if (ts > new TimeSpan())
            {
                string format;
                if (ts.Days > 0)
                    format = "{0} days, {1} hours, {2} minutes";
                else
                    format = "{1} hours, {2} minutes";

                return string.Format(format, ts.Days, ts.Hours, ts.Minutes);
            }
            else
                return "";
        }
    }
}
