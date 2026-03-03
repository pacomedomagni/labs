using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources;

[TsClass]
public class CommercialPolicy
{
    [JsonPropertyName("policySeqId")]
    public int PolicySeqId { get; set; }

    [JsonPropertyName("policyNumber")]
    public string PolicyNumber { get; set; }

    [JsonPropertyName("address")]
    public CommercialAddress Address { get; set; }

    [JsonPropertyName("emailAddress")]
    public string EmailAddress { get; set; }

    [JsonPropertyName("sendDashboard")]
    public bool SendDashboard { get; set; }

    [JsonPropertyName("policySystem")]
    public string PolicySystem { get; set; }

    [JsonPropertyName("createdDate")]
    public DateTime? CreatedDate { get; set; }

    [JsonPropertyName("participants")]
    public CommercialParticipant[] Participants { get; set; }
}

[TsClass]
public class CommercialAddress
{
    [JsonPropertyName("contactName")]
    public string ContactName { get; set; }

    [JsonPropertyName("address1")]
    [Required]
    public string Address1 { get; set; }

    [JsonPropertyName("address2")]
    public string Address2 { get; set; }

    [JsonPropertyName("city")]
    [Required]
    public string City { get; set; }

    [JsonPropertyName("state")]
    [Required]
    public string State { get; set; }

    [JsonPropertyName("zipCode")]
    [Required]
    public string PostalCode { get; set; }
}
