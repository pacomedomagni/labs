using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums
{
    [TsEnum]
    public enum OptOutReasonCode
    {
        CustomerOptOut = 1,
        Cancel = 2,
        DriverDelete = 3,
        VehicleDelete = 4,
        NonInstaller = 5,
        NonCommunicator = 6,
        NotFitMilesTrips = 7,
        NotFitCategoryChangePct = 8,
        MonitoringComplete = 9,
        NotCompleteTwoTerms = 10
    }
}

