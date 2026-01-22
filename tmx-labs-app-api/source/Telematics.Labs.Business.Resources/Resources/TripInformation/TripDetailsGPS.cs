using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

public class TripDetailsGPS
{
    public int TripSeqID { get; set; }
    public int ElapsedTimeMilliseconds { get; set; }
    public DateTime? UtcDateTime { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double Altitude { get; set; }
    public double Heading { get; set; }
    public double SpeedGPS { get; set; }
    public double HDOP { get; set; }
    public double VDOP { get; set; }
    public int HorizontalAccuracy { get; set; }
}


