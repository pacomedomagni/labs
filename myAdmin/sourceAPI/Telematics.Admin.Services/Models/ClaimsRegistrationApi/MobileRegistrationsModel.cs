using Progressive.Telematics.Admin.Business.Resources.Enums;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;

public class MobileRegistrationsModel
{
    [JsonPropertyName("activeRegistration")]
    public RegistrationsModel ActiveRegistration { get; set; }
    [JsonPropertyName("otherRegistrations")]
    public IEnumerable<RegistrationsModel> OtherRegistrations { get; set; }
	public List<RegistrationsModel> GetAllRegistrations()
	{
		var allRegistrations = new List<RegistrationsModel>();

		if (ActiveRegistration == null && OtherRegistrations == null)
			return null;

		if (ActiveRegistration != null)
			allRegistrations.Add(ActiveRegistration);

		if (OtherRegistrations != null)
			allRegistrations.AddRange(OtherRegistrations);

		return allRegistrations;
	}
}

public class RegistrationsModel
{
    [JsonPropertyName("mobileRegistrationCode")]
    public string MobileRegistrationCode { get; set; }
    [JsonPropertyName("telematicsId")]
    public string TelematicsId { get; set; }
    [JsonPropertyName("hasCompletedRegistrationInd")]
    public bool HasCompletedRegistrationInd { get; set; }
    [JsonPropertyName("isRegistrationEligible")]
    public bool IsRegistrationEligible { get; set; }
    [JsonPropertyName("mobileDevice")]
    public RegistrationMobileDevice MobileDevice { get; set; }
    [JsonPropertyName("statusSummary")]
    public string StatusSummary { get; set; }
    [JsonPropertyName("challengeCode")]
    public string ChallengeCode { get; set; }
    [JsonPropertyName("challengeRequestCount")]
    public int? ChallengeRequestCount { get; set; }
    [JsonPropertyName("challengeExpirationDateTime")]
    public DateTime? ChallengeExpirationDateTime { get; set; }
    [JsonPropertyName("lastRegistrationDateTime")]
    public DateTime? MobileLastRegistrationDateTime { get; set; }

    public static StatusSummary? MapMobileRegistrationStatusSummary(string statusSummary)
	{
		return statusSummary switch
		{
			"Inactive" => Business.Resources.Enums.StatusSummary.Inactive,
			"Pending Resolution" => Business.Resources.Enums.StatusSummary.PendingResolution,
			"Disabled" => Business.Resources.Enums.StatusSummary.Disabled,
			"Locked" => Business.Resources.Enums.StatusSummary.Locked,
			"Complete" => Business.Resources.Enums.StatusSummary.Complete,
			"New" => Business.Resources.Enums.StatusSummary.New,
			_ => null
		};
	}
}

public class RegistrationMobileDevice
{
    [JsonPropertyName("mobileDeviceId")]
    public string MobileDeviceId { get; set; }
    [JsonPropertyName("lastContactDateTime")]
    public DateTime? LastContactDateTime { get; set; }
    [JsonPropertyName("firstContactDateTime")]
    public DateTime? FirstContactDateTime { get; set; }
}

