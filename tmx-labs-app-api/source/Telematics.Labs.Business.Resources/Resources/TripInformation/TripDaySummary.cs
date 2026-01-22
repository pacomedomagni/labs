using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Shared;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
public class TripDaySummary
{
    public DateTime TripDay { get; set; }
    public int TotalTrips => Trips?.Count ?? 0;
    public string TotalDuration
    {
        get
        {
            var duration = TimeSpan.FromTicks(Trips?.Sum(t => t.TripDuration?.Ticks) ?? 0);
            return $"{(int)duration.TotalHours:D2}:{duration.Minutes:D2}:{duration.Seconds:D2}";
        }
    }
    public decimal Mileage => Trips?.Sum(t => (t.TripKilometers ?? 0) * Constants.ConversionConstants.KilometersToMiles) ?? 0;
    public decimal HighRiskSeconds => Trips.Sum(t => t.HighRiskSeconds ?? 0);
    public int HardAccels => Trips.Sum(t => t.HardAccelerations ?? 0);
    public int HardBrakes => Trips.Sum(t => t.HardBrakes ?? 0);
    public List<Trip> Trips { get; set; }
}
