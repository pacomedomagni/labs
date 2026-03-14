using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class TripStatsGetResponse
    {
        [JsonPropertyName("ratedDistractedDriving")]
        public bool RatedDistractedDriving { get; set; }

        [JsonPropertyName("dailyTotals")]
        public IList<DailyTotal> DailyTotals { get; set; }

        [JsonPropertyName("dailyAverages")]
        public IList<DailyAverage> DailyAverages { get; set; }

        [JsonPropertyName("averages")]
        public Averages Averages { get; set; }

        [JsonPropertyName("tripAggregates")]
        public TripAggregates TripAggregates { get; set; }
    }

    public class TripAggregates
    {
        [JsonPropertyName("totalTripCount")]
        public int TotalTripCount { get; set; }

        [JsonPropertyName("totalMiles")]
        public int TotalMiles { get; set; }

        [JsonPropertyName("totalTripDurationMinutes")]
        public int TotalTripDurationMinutes { get; set; }
    }

    public class Averages
    {
        [JsonPropertyName("overall7DayAvgMiles")]
        public double Overall7DayAvgMiles { get; set; }

        [JsonPropertyName("overall7DayAvgHardBrakes")]
        public double Overall7DayAvgHardBrakes { get; set; }

        [JsonPropertyName("overall7DayAvgHardAccelerations")]
        public double Overall7DayAvgHardAccelerations { get; set; }

        [JsonPropertyName("overall7DayAvgHighRiskSeconds")]
        public double Overall7DayAvgHighRiskSeconds { get; set; }

        [JsonPropertyName("overall7DayAvgTripDuration")]
        public double Overall7DayAvgTripDuration { get; set; }

        [JsonPropertyName("overall7DayAvgPhoneUsageHandsFreeSeconds")]
        public double? Overall7DayAvgPhoneUsageHandsFreeSeconds { get; set; }

        [JsonPropertyName("overall7DayAvgPhoneUsageInHandSeconds")]
        public double? Overall7DayAvgPhoneUsageInHandSeconds { get; set; }

        [JsonPropertyName("overall7DayAvgAppUsageHandsFreeSeconds")]
        public double? Overall7DayAvgAppUsageHandsFreeSeconds { get; set; }

        [JsonPropertyName("overall7DayAvgAppUsageInHandSeconds")]
        public double? Overall7DayAvgAppUsageInHandSeconds { get; set; }

        [JsonPropertyName("last7DayTotalMiles")]
        public double Last7DayTotalMiles { get; set; }

        [JsonPropertyName("last7DayTotalHardBrakes")]
        public double Last7DayTotalHardBrakes { get; set; }

        [JsonPropertyName("last7DayTotalHardAccelerations")]
        public double Last7DayTotalHardAccelerations { get; set; }

        [JsonPropertyName("last7DayTotalHighRiskSeconds")]
        public double Last7DayTotalHighRiskSeconds { get; set; }

        [JsonPropertyName("last7DayTotalTripDuration")]
        public double Last7DayTotalTripDuration { get; set; }

        [JsonPropertyName("last7DayTotalPhoneUsageHandsFreeSeconds")]
        public double? Last7DayTotalPhoneUsageHandsFreeSeconds { get; set; }

        [JsonPropertyName("last7DayTotalPhoneUsageInHandSeconds")]
        public double? Last7DayTotalPhoneUsageInHandSeconds { get; set; }

        [JsonPropertyName("last7DayTotalAppUsageHandsFreeSeconds")]
        public double? Last7DayTotalAppUsageHandsFreeSeconds { get; set; }

        [JsonPropertyName("last7DayTotalAppUsageInHandSeconds")]
        public double? Last7DayTotalAppUsageInHandSeconds { get; set; }
    }

    public class DailyTotal
    {
        [JsonPropertyName("date")]
        public string Date { get; set; }

        [JsonPropertyName("tripTotal")]
        public int TripTotal { get; set; }

        [JsonPropertyName("tripMileageTotal")]
        public double TripMileageTotal { get; set; }

        [JsonPropertyName("tripDurationTotalSeconds")]
        public int TripDurationTotalSeconds { get; set; }

        [JsonPropertyName("hardBrakeTotal")]
        public int HardBrakeTotal { get; set; }

        [JsonPropertyName("hardAccelerationTotal")]
        public int HardAccelerationTotal { get; set; }

        [JsonPropertyName("highRiskSecondsTotal")]
        public int HighRiskSecondsTotal { get; set; }

        [JsonPropertyName("phoneUsageHandsFreeTotalSeconds")]
        public int? PhoneUsageHandsFreeTotalSeconds { get; set; }

        [JsonPropertyName("phoneUsageInHandTotalSeconds")]
        public int? PhoneUsageInHandTotalSeconds { get; set; }

        [JsonPropertyName("applicationUsageHandsFreeTotalSeconds")]
        public int? ApplicationUsageHandsFreeTotalSeconds { get; set; }

        [JsonPropertyName("applicationUsageInHandTotalSeconds")]
        public int? ApplicationUsageInHandTotalSeconds { get; set; }
    }

    public class DailyAverage
    {
        [JsonPropertyName("dayOfWeek")]
        public string DayOfWeek { get; set; }

        [JsonPropertyName("averageTripCount")]
        public double AverageTripCount { get; set; }

        [JsonPropertyName("averageTripMileage")]
        public double AverageTripMileage { get; set; }

        [JsonPropertyName("averageHardBrakes")]
        public double AverageHardBrakes { get; set; }

        [JsonPropertyName("averageHardAccelerations")]
        public double AverageHardAccelerations { get; set; }

        [JsonPropertyName("averageHighRiskSeconds")]
        public double AverageHighRiskSeconds { get; set; }

        [JsonPropertyName("averageTripDuration")]
        public double AverageTripDuration { get; set; }

        [JsonPropertyName("averagePhoneUsageHandsFreeSeconds")]
        public double? AveragePhoneUsageHandsFreeSeconds { get; set; }

        [JsonPropertyName("averagePhoneUsageInHandSeconds")]
        public double? AveragePhoneUsageInHandSeconds { get; set; }

        [JsonPropertyName("averageAppUsageHandsFreeSeconds")]
        public double? AverageAppUsageHandsFreeSeconds { get; set; }

        [JsonPropertyName("averageAppUsageInHandSeconds")]
        public double? AverageAppUsageInHandSeconds { get; set; }
    }
}
