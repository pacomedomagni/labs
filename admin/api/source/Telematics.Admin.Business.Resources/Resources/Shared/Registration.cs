using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class Registration : Resource
    {
        [JsonPropertyName("mobileRegistrationSeqId")]
        public int MobileRegistrationSeqId { get; set; }

        [JsonPropertyName("groupExternalId")]
        public string GroupExternalId { get; set; }

        [JsonPropertyName("participantExternalId")]
        public string ParticipantExternalId { get; set; }

        [JsonPropertyName("vehicleExternalId")]
        public string VehicleExternalId { get; set; }

        [JsonPropertyName("driverExternalId")]
        public string DriverExternalId { get; set; }

        [JsonPropertyName("driverFirstName")]
        public string DriverFirstName { get; set; }

        [JsonPropertyName("driverLastName")]
        public string DriverLastName { get; set; }

        [JsonPropertyName("mobileDeviceId")]
        public string MobileDeviceId { get; set; }

        [JsonPropertyName("programCode")]
        public ProgramCode ProgramCode { get; set; }

        [JsonPropertyName("mobileRegistrationCode")]
        public string MobileRegistrationCode { get; set; }

        [JsonPropertyName("mobileChallengeCode")]
        public string MobileChallengeCode { get; set; }

        [JsonPropertyName("mobileApiTokenId")]
        public string MobileApiTokenId { get; set; }

        [JsonPropertyName("challengeRequestCount")]
        public int? ChallengeRequestCount { get; set; }

        [JsonPropertyName("challengeExpirationDateTime")]
        public DateTime? ChallengeExpirationDateTime { get; set; }

        private MobileRegistrationStatus? _mobileRegistrationStatusCode;

        [JsonPropertyName("mobileRegistrationStatusCode")]
        public MobileRegistrationStatus? MobileRegistrationStatusCode
        {
            get
            {
                if(_mobileRegistrationStatusCode != null)
                {
                    return _mobileRegistrationStatusCode;
                }
                else if (_statusSummary == null)
                {
                    return null;
                }
                else
                {
                    return MapMobileRegistrationStatusCode(_statusSummary);
                }
            }
            set => _mobileRegistrationStatusCode = value;
        }

        private StatusSummary? _statusSummary;

        [JsonPropertyName("statusSummary")]
        public StatusSummary? StatusSummary
        {
            get
            {
                if(_statusSummary != null)
                {
                    return _statusSummary;
                }
                else if (_mobileRegistrationStatusCode == null)
                {
                    return null;
                }
                else
                {
                    return MapStatusSummary(_mobileRegistrationStatusCode, ChallengeRequestCount, MobileLastRegistrationDateTime);
                }
            }
            set => _statusSummary = value;
        }

        [JsonPropertyName("newMobileRegistrationStatusDescription")]
        public string NewMobileRegistrationStatusDescription { get; set; }

        [JsonPropertyName("lastChangeDateTime")]
        public DateTime LastChangeDateTime { get; set; }

        [JsonPropertyName("mobileLastRegistrationDateTime")]
        public DateTime? MobileLastRegistrationDateTime { get; set; }

        [JsonPropertyName("policyParticipant")]
        public PolicyDriverData PolicyParticipant { get; set; }

        private static StatusSummary? MapStatusSummary(MobileRegistrationStatus? mobileRegistrationStatusCode, int? challengeRequestCount, DateTime? mobileLastRegistrationDateTime)
        {
            if (mobileRegistrationStatusCode == MobileRegistrationStatus.Inactive)
                return Enums.StatusSummary.Inactive;

            if (mobileRegistrationStatusCode == MobileRegistrationStatus.PendingResolution)
                return Enums.StatusSummary.PendingResolution;

            if (mobileRegistrationStatusCode == MobileRegistrationStatus.Disabled)
                return Enums.StatusSummary.Disabled;

            if (mobileRegistrationStatusCode == MobileRegistrationStatus.Locked || challengeRequestCount >= 10)
                return Enums.StatusSummary.Locked;

            if (ComputeHasCompletedRegistrationInd(mobileRegistrationStatusCode, mobileLastRegistrationDateTime))
                return Enums.StatusSummary.Complete;

            return Enums.StatusSummary.New;
        }

        private static bool ComputeHasCompletedRegistrationInd(MobileRegistrationStatus? mobileRegistrationStatusCode, DateTime? mobileLastRegistrationDateTime)
        {
            return
            (
                mobileRegistrationStatusCode != null
                && (mobileRegistrationStatusCode == MobileRegistrationStatus.RegistrationComplete || (mobileLastRegistrationDateTime != null && mobileLastRegistrationDateTime.HasValue))
            );
        }

        private static MobileRegistrationStatus? MapMobileRegistrationStatusCode(StatusSummary? statusSummary)
        {
            return statusSummary switch
            {
                Enums.StatusSummary.Inactive => MobileRegistrationStatus.Inactive,
                Enums.StatusSummary.PendingResolution => MobileRegistrationStatus.PendingResolution,
                Enums.StatusSummary.Disabled => MobileRegistrationStatus.Disabled,
                Enums.StatusSummary.Locked => MobileRegistrationStatus.Locked,
                Enums.StatusSummary.Complete => MobileRegistrationStatus.RegistrationComplete,
                Enums.StatusSummary.New=> MobileRegistrationStatus.NotRegistered,
                _ => null
            };
        }
    }
}
