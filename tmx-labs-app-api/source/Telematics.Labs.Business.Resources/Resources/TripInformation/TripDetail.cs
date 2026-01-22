using System.Data;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Shared;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
public class TripDetail
{
    public int ElapsedTimeMilliseconds { get; set; }
    public byte Speed { get; set; }

    public TripDetail(DataRow row, TripSpeedDistanceUnit unit)
    {
       
        ElapsedTimeMilliseconds = (int)row["ElapsedTimeMilliseconds"];

        Speed = unit == TripSpeedDistanceUnit.Kilometers ?
            (byte)row["SpeedKPH"] :
            (byte)((byte)row["SpeedKPH"] * Constants.ConversionConstants.KilometersToMiles);
    }
}
