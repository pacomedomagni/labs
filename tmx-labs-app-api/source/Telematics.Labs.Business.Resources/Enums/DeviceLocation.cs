using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums
{
    [TsEnum]
    public enum DeviceLocation
    {
        Progressive = 1,
        Distributor = 2,
        ShippedFromMfgtoDist = 3,
        ShippedFromPrgtoDist = 4,
        ShippedToCustomer = 5,
        InVehicle = 6,
        Unknown = 7
    }
}

