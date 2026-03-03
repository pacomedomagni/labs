using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum UserRoles
    {
        OpsAdmin,
        OpsUser,
        SupportAdmin,
        Theft,
        MobileRegistrationAdmin,
        ChangeAppAssignment,
        FeeReversal,
        CommercialLineRole
    }

    [TsEnum]
    public enum UserAccess
    {
        Eligibility,
        InsertInitialParticipationScoreInProcess,
        OptOutSuspension,
        PolicyMerge,
        ResetEnrollment,
        StopShipment,
        UpdatePProGuid,
        VehicleSupport
    }
}
