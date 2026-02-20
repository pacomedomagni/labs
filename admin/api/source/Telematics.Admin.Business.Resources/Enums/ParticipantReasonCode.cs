using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum ParticipantReasonCode
    {
        None = 0,
        ParticipantOptedOut = 1,
        PolicyCanceled = 2,
        RenewalWorkCreated = 8,
        CollectingData = 11,
        NeedsDeviceAssigned = 14,
        DeviceReplacementNeeded = 16,
        FlatDelete = 22,
        DeviceReturnedAutomatedOptOutInProcess = 42,
        AutomatedOptOutEndorsementPending = 43,
        AutomatedOptInEndorsementPending = 44,
        MobilePendingRegistration = 60
    }
}
