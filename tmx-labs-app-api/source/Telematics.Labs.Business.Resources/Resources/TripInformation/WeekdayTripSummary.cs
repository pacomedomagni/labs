using System;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

public class DayOfWeekTripSummary
{
    public DayOfWeek DayOfWeek { get; set; }
    public int Trips { get; set; }
    public TimeSpan Duration { get; set; }

    public decimal Mileage { get; set; }
    public int HardBrakes { get; set; }
    public int HardAccels { get; set; }
    public int HighRiskSeconds { get; set; }
}
