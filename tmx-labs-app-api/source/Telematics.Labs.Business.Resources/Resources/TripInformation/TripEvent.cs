using System;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

public class TripEvent
{
    public int TripEventSeqID { get; set; }
    public int TripSeqID { get; set; }
    public DateTime? TripEventDateTime { get; set; }
    public int? TripEventTypeCode { get; set; }
    public double? SpeedKPH { get; set; }
    public double? LatitudeNbr { get; set; }
    public double? LongitudeNbr { get; set; }
    public DateTime? EventTimestamp { get; set; }
    public int? EventTimeZoneOffsetNbr { get; set; }
    public string Description { get; set; }
    public double? LatitudeDeltaNbr { get; set; }
    public double? LongitudeDeltaNbr { get; set; }
    public int? EventDurationSeconds { get; set; }
}
