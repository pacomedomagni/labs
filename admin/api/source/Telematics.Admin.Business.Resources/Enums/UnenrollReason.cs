using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum UnenrollReason
    {
        DeviceNotEligible = 1,
        DriverAdded = 2,
        DriverLicenseChange = 3,
        DriverNotEligible = 4,
        DriverStatusChange = 5,
        ExpireNonPay = 6,
        NonCommunicator = 7,
        NonInstaller = 8,
        PolicyCancel = 9,
        UserInitiated = 10,
        VehicleAdded = 11,
        DriverDeleted = 12
    }
}
