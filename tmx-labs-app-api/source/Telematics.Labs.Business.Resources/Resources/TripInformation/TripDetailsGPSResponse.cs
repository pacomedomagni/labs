using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
public class TripDetailsGPSResponse
{
    public TripDetailsGPSResponse()
    {
        TripDetails = new List<TripDetailsGPS>();
        TripEvents = new List<TripEvent>();
    }
    public List<TripDetailsGPS> TripDetails { get; set; }
    public List<TripEvent> TripEvents { get; set; }
}
