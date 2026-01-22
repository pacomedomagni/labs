using System;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

public class ExcludedDateRange
{
    public DateTime RangeStart { get; set; }
    public DateTime RangeEnd { get; set; }
    public string Description { get; set; }
    public DateTime CreateDate { get; set; }
    public int ParticipantSeqId { get; set; }
}
