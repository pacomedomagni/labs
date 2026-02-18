import { DeviceLotStatus } from "./resources";

export const DeviceLotStatusDescription = new Map<DeviceLotStatus, string>([
    [DeviceLotStatus.ShippedToDistributor, "Shipped To Distributor"],
    [DeviceLotStatus.ShipmentReceivedByDistributor, "Shipment Received By Distributor"],
    [DeviceLotStatus.AssigningDevices, "Assigning Devices"],
    [DeviceLotStatus.UsedForTest, "Used For Testing"],
    [DeviceLotStatus.ShippedToManufacturer, "Shipped To Manufacturer"],
    [DeviceLotStatus.ShipmentReceivedByManufacturer, "Shipment Received By Manufacturer"],
    [DeviceLotStatus.AssignedToRMA, "Assigned To RMA"],
    [DeviceLotStatus.Storage, "Storage"],
    [DeviceLotStatus.Obsolete, "Obsolete"],
]);