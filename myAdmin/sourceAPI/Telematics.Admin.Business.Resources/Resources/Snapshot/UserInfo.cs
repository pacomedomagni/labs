using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class UserInfo
    {


        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("lanId")]
        public string LanId { get; set; }

        [JsonPropertyName("isInOpsAdminRole")]
        public bool IsInOpsAdminRole { get; set; }

        [JsonPropertyName("isInOpsUserRole")]
        public bool IsInOpsUserRole { get; set; }

        [JsonPropertyName("isInSupportAdminRole")]
        public bool IsInSupportAdminRole { get; set; }

        [JsonPropertyName("isInTheftRole")]
        public bool IsInTheftRole { get; set; }

        [JsonPropertyName("isInFeeReversalRole")]
        public bool IsInFeeReversalRole { get; set; }

        [JsonPropertyName("isInMobileRegistrationAdminRole")]
        public bool IsInMobileRegistrationAdminRole { get; set; }

        [JsonPropertyName("isInAppChangeRole")]
        public bool IsInAppChangeRole { get; set; }

        [JsonPropertyName("hasEligibilityAccess")]
        public bool HasEligibilityAccess { get; set; }

        [JsonPropertyName("hasInsertInitialParticipationScoreInProcessAccess")]
        public bool HasInsertInitialParticipationScoreInProcessAccess { get; set; }

        [JsonPropertyName("hasOptOutSuspensionAccess")]
        public bool HasOptOutSuspensionAccess { get; set; }

        [JsonPropertyName("hasPolicyMergeAccess")]
        public bool HasPolicyMergeAccess { get; set; }

        [JsonPropertyName("hasResetEnrollmentAccess")]
        public bool HasResetEnrollmentAccess { get; set; }

        [JsonPropertyName("hasStopShipmentAccess")]
        public bool HasStopShipmentAccess { get; set; }

        [JsonPropertyName("hasUpdatePProGuidAccess")]
        public bool HasUpdatePProGuidAccess { get; set; }

        [JsonPropertyName("hasVehicleSupportAccess")]
        public bool HasVehicleSupportAccess { get; set; }

        [JsonPropertyName("isCommercialLineRole")]
        public bool IsCommercialLineRole { get; set; }

        [JsonPropertyName("isInMobileRegSearchPilot")]
        public bool IsInMobileRegSearchPilot { get; set; }

        [JsonPropertyName("isInTheftOnlyRole")]
        public bool IsInTheftOnlyRole
        {
            get
            {
                return IsInTheftRole && !IsInOpsAdminRole && !IsInSupportAdminRole;
            }
        }

        [JsonPropertyName("isInFeeReversalOnlyRole")]
        public bool IsInFeeReversalOnlyRole
        {
            get
            {
                return IsInFeeReversalRole && !IsInOpsAdminRole && !IsInSupportAdminRole;
            }
        }
    }
}
