using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources;

[TsClass]
public class CommercialTrips
{
    [JsonPropertyName("tripSeqID")]
    public int TripSeqID { get; set; }

    [JsonPropertyName("trips")]
    public int Trips { get; set; }

    [JsonPropertyName("date")]
    public DateTime Date { get; set; }

    [JsonPropertyName("duration")]
    public TimeSpan Duration { get; set; }

    [JsonPropertyName("distance")]
    public Double Distance { get; set; }

    [JsonPropertyName("hardBreaks")]
    public Int32 HardBreaks { get; set; }

    [JsonPropertyName("excluded")]
    public bool Excluded { get; set; }

    [JsonPropertyName("details")]
    public CommercialTrip[]? Details { get; set; }
}

public class CommercialTrip
{
    [JsonPropertyName("tripSeqID")]
    public int TripSeqID { get; set; }

    [JsonPropertyName("trips")]
    public int Trips { get; set; }

    [JsonPropertyName("date")]
    public DateTime Date { get; set; }

    [JsonPropertyName("duration")]
    public TimeSpan Duration { get; set; }

    [JsonPropertyName("distance")]
    public Double Distance { get; set; }

    [JsonPropertyName("hardBreaks")]
    public Int32 HardBreaks { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    [JsonPropertyName("excluded")]
    public bool Excluded { get; set; }
}
