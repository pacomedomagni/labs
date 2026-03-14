using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class TripsGetResponse
    {
        [JsonPropertyName("trips")]
        public List<Trip> Trips { get; set; }

        [JsonPropertyName("ratedDistractedDriving")]
        public bool RatedDistractedDriving { get; set; }

        [JsonPropertyName("self")]
        public string Self { get; set; }

        [JsonPropertyName("next")]
        public string Next { get; set; }

        [JsonPropertyName("prev")]
        public string Prev { get; set; }
    }

    public class Trip
    {
        [JsonPropertyName("tripId")]
        public string TripId { get; set; }

        [JsonPropertyName("startDateTime")]
        public DateTime StartDateTime { get; set; }

        [JsonPropertyName("endDateTime")]
        public DateTime EndDateTime { get; set; }

        [JsonPropertyName("mileage")]
        public double Mileage { get; set; }

        [JsonPropertyName("totalHardBrakes")]
        public int TotalHardBrakes { get; set; }

        [JsonPropertyName("totalHardAccelerations")]
        public int TotalHardAccelerations { get; set; }

        [JsonPropertyName("highRiskSeconds")]
        public int HighRiskSeconds { get; set; }

        [JsonPropertyName("totalDistractedDrivingCount")]
        public int? TotalDistractedDrivingCount { get; set; }

        [JsonPropertyName("phoneHandsFreeUsageSeconds")]
        public int? PhoneHandsFreeUsageSeconds { get; set; }

        [JsonPropertyName("phoneInHandUsageSeconds")]
        public int? PhoneInHandUsageSeconds { get; set; }

        [JsonPropertyName("appHandsFreeUsageSeconds")]
        public int? AppHandsFreeUsageSeconds { get; set; }

        [JsonPropertyName("appInHandUsageSeconds")]
        public int? AppInHandUsageSeconds { get; set; }

        [JsonPropertyName("tripEvents")]
        public List<TripEvent> TripEvents { get; set; }

        [JsonPropertyName("startDateTimeOffset")]
        public DateTimeOffset? StartDateTimeOffset { get; set; }

        [JsonPropertyName("endDateTimeOffset")]
        public DateTimeOffset? EndDateTimeOffset { get; set; }
    }

    public class TripEvent
    {
        [JsonPropertyName("eventType")]
        public string EventType { get; set; }

        [JsonPropertyName("startDateTime")]
        public DateTime StartDateTime { get; set; }

        [JsonPropertyName("endDateTime")]
        public DateTime? EndDateTime { get; set; }

        [JsonPropertyName("startLatNbr")]
        public decimal? StartLatNbr { get; set; }

        [JsonPropertyName("startLongNbr")]
        public decimal? StartLongNbr { get; set; }

        [JsonPropertyName("endLatNbr")]
        public decimal? EndLatNbr { get; set; }

        [JsonPropertyName("endLongNbr")]
        public decimal? EndLongNbr { get; set; }

        [JsonPropertyName("startDateTimeOffset")]
        public DateTimeOffset? StartDateTimeOffset { get; set; }

        [JsonPropertyName("endDateTimeOffset")]
        public DateTimeOffset? EndDateTimeOffset { get; set; }
    }
}
