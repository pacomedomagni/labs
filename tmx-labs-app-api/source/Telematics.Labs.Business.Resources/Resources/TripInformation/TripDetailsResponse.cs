using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
public class TripDetailsResponse
{
    private TripDetail[] _details;
    public int RecordCount { get; set; }
    public TripSpeedDistanceUnit SpeedDistanceUnit { get; set; }
    public TripDetail[] GetDetails() => _details;
    public void SetDetails(TripDetail[] value) => _details = value;
}
