using System.ComponentModel;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum MobileRegistrationStatus
    {
        None = -1,
        Disabled = 0,
        Inactive = 2,
        PendingResolution = 6,
        Locked = 8,
        NotRegistered = 10,
        ChallengeInProcess = 20,
        ChallegeError = 22,
        ChallengeComplete = 24,
        Authenticated = 30,
        VehicleSelectionComplete = 40,
        ServerVerifyComplete = 50,
        RegistrationCompleteInProcess = 60,
        RegistrationCompleteError = 62,
        RegistrationComplete = 64
    }
}
