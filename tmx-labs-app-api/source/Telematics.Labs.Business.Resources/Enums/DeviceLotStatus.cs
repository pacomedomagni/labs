using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums
{
    [TsEnum]
    public enum DeviceLotStatus
    {
        ShippedToDistributor = 1,
        ShipmentReceivedByDistributor = 2,
        AssigningDevices = 3,
        UsedForTest = 4,
        ShippedToManufacturer = 5,
        ShipmentReceivedByManufacturer = 6,
        AssignedToRMA = 7,
        Storage = 8,
        Obsolete = 9
    }
}

