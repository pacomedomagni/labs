
using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
public class TripDetailsRequest
{
        public long TripSeqId { get; set; }
        public TripSpeedDistanceUnit SpeedDistanceUnit { get; set; }
}
