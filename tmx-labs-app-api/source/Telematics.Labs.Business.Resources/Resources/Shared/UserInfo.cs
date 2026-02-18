using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources;

[TsClass]
public class UserInfo
{
    public string Name { get; set; }
    public string LanId { get; set; }
    public bool IsLabsAdmin { get; set; }
    public bool IsLabsUser { get; set; }
    public bool IsInOpsAdminRole { get; set; }
    public bool IsInOpsUserRole { get; set; }
    public bool IsInSupportAdminRole { get; set; }
    public bool IsCommercialLineRole { get; set; }
    public bool HasEligibilityAccess { get; set; }
    public bool HasInsertInitialParticipationScoreInProcessAccess { get; set; }
    public bool HasOptOutSuspensionAccess { get; set; }
    public bool HasPolicyMergeAccess { get; set; }
    public bool HasResetEnrollmentAccess { get; set; }
    public bool HasStopShipmentAccess { get; set; }
    public bool HasUpdatePProGuidAccess { get; set; }
    public bool HasVehicleSupportAccess { get; set; }
    public bool IsInMobileRegistrationAdminRole { get; set; }
    public bool IsInTheftOnlyRole { get; set; }
    public bool IsInTheftRole { get; set; }
    public bool IsInFeeReversalOnlyRole { get; set; }
    public bool IsInFeeReversalRole { get; set; }
    public bool IsInAppChangeRole { get; set; }
}

