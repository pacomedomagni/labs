using System;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation
{
    public class ExcludedDateRangeCommand
    {
        public int ParticipantSeqId { get; set; }
        public DateTime RangeStart { get; set; }
        public DateTime RangeEnd { get; set; }
        public string? Description { get; set; }
        public DateTime? OriginalRangeStart { get; set; }
    }

    public class ExcludedDateRangeDeleteCommand
    {
        public int ParticipantSeqId { get; set; }
        public DateTime RangeStart { get; set; }
    }
}
