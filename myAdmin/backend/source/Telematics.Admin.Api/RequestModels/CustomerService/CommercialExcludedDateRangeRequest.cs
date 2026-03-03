using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Api.Converters;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService;

public class CommercialExcludedDateRangeRequest
{
    [Required]
    public int ParticipantSeqId { get; set; }

    [Required]
    [JsonConverter(typeof(DateTimeJsonConverter))]
    public DateTime StartDate { get; set; }

    [Required]
    [JsonConverter(typeof(DateTimeJsonConverter))]
    public DateTime EndDate { get; set; }

    [Required]
    public int ReasonCode { get; set; }

    [MaxLength(50, ErrorMessage = "Description must be less than 50 characters")]
    public string Description { get; set; }
}
