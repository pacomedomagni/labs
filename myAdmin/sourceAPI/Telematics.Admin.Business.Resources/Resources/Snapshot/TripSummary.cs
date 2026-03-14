using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class TripSummary : Resource
    {
        [JsonPropertyName("trips")]
        public IEnumerable<TripSummaryDaily> Trips { get; set; }
    }

    [TsClass]
    public class TripSummaryDaily : Resource
    {
        [JsonPropertyName("seqId")]
        public long SeqId { get; set; }

        [JsonPropertyName("tripDate")]
        public DateTime TripDate { get; set; }

        [JsonPropertyName("tripEndDate")]
        public DateTime TripEndDate { get; set; }

        [JsonPropertyName("duration")]
        [Column("TripDuration")]
        public TimeSpan Duration { get; set; }

        [JsonPropertyName("mileage")]
        [Column("TripMileage")]
        public decimal Mileage { get; set; }

        [JsonPropertyName("hardBrakes")]
        public int HardBrakes { get; set; }

        [JsonPropertyName("extremeHardBrakes")]
        public int ExtremeHardBrakes { get; set; }

        [JsonPropertyName("tripCount")]
        public int TripCount { get; set; }

        [JsonPropertyName("hardAccelerations")]
        public int HardAccelerations { get; set; }

        [JsonPropertyName("highRiskSeconds")]
        public int HighRiskSeconds { get; set; }

        [JsonPropertyName("tripRegularity")]
        public int TripRegularity { get; set; }

        [JsonPropertyName("distractedDrivingInfo")]
        public TripSummaryDistractedDriving DistractedDrivingInfo { get; set; }

        [JsonPropertyName("lowRisk")]
        public string LowRisk { get; set; }

        [JsonPropertyName("mediumRisk")]
        public string MediumRisk { get; set; }

        [JsonPropertyName("highRisk")]
        public string HighRisk { get; set; }
    }

    [TsClass]
    public class TripSummaryDistractedDriving : Resource
    {
        [JsonPropertyName("applicationUsageHandsFree")]
        public int ApplicationUsageHandsFree { get; set; }

        [JsonPropertyName("applicationUsageInHand")]
        public int ApplicationUsageInHand { get; set; }

        [JsonPropertyName("phoneUsageHandsFree")]
        public int PhoneUsageHandsFree { get; set; }

        [JsonPropertyName("phoneUsageInHand")]
        public int PhoneUsageInHand { get; set; }
    }

    [TsClass]
    public class TripEvent
    {
        [JsonPropertyName("eventDate")]
        public DateTime EventDate { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("speed")]
        public byte Speed { get; set; }
    }

    [TsClass]
    public class ParticipantDeviceTripEvent
    {
        [JsonPropertyName("eventSeqId")]
        public int EventSeqId { get; set; }

        [JsonPropertyName("eventTime")]
        public DateTime EventTime { get; set; }

        [JsonPropertyName("eventDescription")]
        public string EventDescription { get; set; }

        [JsonPropertyName("eventCode")]
        public byte? EventCode { get; set; }

        [JsonPropertyName("protocolCode")]
        public ProtocolCode? ProtocolCode { get; set; }

        [JsonPropertyName("vin")]
        [TsProperty(Name = "vin")]
        public string VIN { get; set; }

        [JsonPropertyName("odometerReading")]
        public int? OdometerReading { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime? CreateDate { get; set; }
    }
}
