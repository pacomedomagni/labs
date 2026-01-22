export enum DeviceActivationRequestType {
	Status = "Status",
	Activate = "Activate",
	Deactivate = "Deactivate"
}
export enum DeviceExperience {
	None = "None",
	Device = "Device",
	Mobile = "Mobile",
	OEM = "OEM"
}
export enum DeviceFeature {
	Audio = "Audio",
	BlueLight = "BlueLight",
	Accelerometer = "Accelerometer",
	GPS = "GPS",
	GPSToggle = "GPSToggle",
	AWSIot = "AWSIot"
}
export enum DeviceLocation {
	Progressive = "Progressive",
	Distributor = "Distributor",
	ShippedFromMfgtoDist = "ShippedFromMfgtoDist",
	ShippedFromPrgtoDist = "ShippedFromPrgtoDist",
	ShippedToCustomer = "ShippedToCustomer",
	InVehicle = "InVehicle",
	Unknown = "Unknown"
}

export enum DeviceLotStatus {
	ShippedToDistributor = "ShippedToDistributor",
	ShipmentReceivedByDistributor = "ShipmentReceivedByDistributor",
	AssigningDevices = "AssigningDevices",
	UsedForTest = "UsedForTest",
	ShippedToManufacturer = "ShippedToManufacturer",
	ShipmentReceivedByManufacturer = "ShipmentReceivedByManufacturer",
	AssignedToRMA = "AssignedToRMA",
	Storage = "Storage",
	Obsolete = "Obsolete"
}
export enum DeviceLotType {
	Manufacturer = "Manufacturer",
	Returned = "Returned",
	RMA = "RMA",
	Inventory = "Inventory"
}
export enum DeviceReturnReasonCode {
	OptOut = "OptOut",
	Cancel = "Cancel",
	NonInstaller = "NonInstaller",
	DeviceReplaced = "DeviceReplaced",
	CustomerReturn = "CustomerReturn",
	DeviceProblem = "DeviceProblem",
	DeviceRefused = "DeviceRefused",
	DeviceUnclaimed = "DeviceUnclaimed",
	MarkedReturned = "MarkedReturned",
	DeviceUndeliverable = "DeviceUndeliverable",
	Abandoned = "Abandoned",
	NonCommunicator = "NonCommunicator",
	DiscountQualified = "DiscountQualified",
	DiscountDisqualified = "DiscountDisqualified",
	ManualMonitoringComplete = "ManualMonitoringComplete"
}
export enum DeviceStatus {
	Available = "Available",
	Inactive = "Inactive",
	Assigned = "Assigned",
	Abandoned = "Abandoned",
	CustomerReturn = "CustomerReturn",
	Unavailable = "Unavailable",
	Defective = "Defective",
	Batched = "Batched",
	ReadyForPrep = "ReadyForPrep",
	ReadyForBenchTest = "ReadyForBenchTest"
}

export enum DeviceOrderStatus {
	New = "New",
	DevicesAssigned = "DevicesAssigned",
	Shipped = "Shipped",
	Cancelled = "Cancelled"

}

export enum BenchTestBaoardStatus {
	Available = "Available",
	Testing = "Testing",
	Complete = "Complete"
}

export const BenchTestBaoardStatusValue = new Map<BenchTestBaoardStatus, number>([
	[BenchTestBaoardStatus.Available, 1],
	[BenchTestBaoardStatus.Testing, 2],
	[BenchTestBaoardStatus.Complete, 3]
]);

export const DeviceReturnReasonCodeValue = new Map<DeviceReturnReasonCode, number>([
	[DeviceReturnReasonCode.OptOut, 1],
	[DeviceReturnReasonCode.Cancel, 2],
	[DeviceReturnReasonCode.NonInstaller, 3],
	[DeviceReturnReasonCode.DeviceReplaced, 4],
	[DeviceReturnReasonCode.CustomerReturn, 5],
	[DeviceReturnReasonCode.DeviceProblem, 6],
	[DeviceReturnReasonCode.DeviceRefused, 7],
	[DeviceReturnReasonCode.DeviceUnclaimed, 8],
	[DeviceReturnReasonCode.MarkedReturned, 9],
	[DeviceReturnReasonCode.DeviceUndeliverable, 10],
	[DeviceReturnReasonCode.Abandoned, 11],
	[DeviceReturnReasonCode.NonCommunicator, 12],
	[DeviceReturnReasonCode.DiscountQualified, 13],
	[DeviceReturnReasonCode.DiscountDisqualified, 14],
	[DeviceReturnReasonCode.ManualMonitoringComplete, 15]
]);
export const DeviceStatusValue = new Map<DeviceStatus, number>([
	[DeviceStatus.Available, 1],
	[DeviceStatus.Inactive, 2],
	[DeviceStatus.Assigned, 3],
	[DeviceStatus.Abandoned, 4],
	[DeviceStatus.CustomerReturn, 5],
	[DeviceStatus.Unavailable, 6],
	[DeviceStatus.Defective, 7],
	[DeviceStatus.Batched, 8],
	[DeviceStatus.ReadyForPrep, 9],
	[DeviceStatus.ReadyForBenchTest, 10]
]);

export const DeviceOrderStatusValue = new Map<DeviceOrderStatus, number>([
	[DeviceOrderStatus.New, 1],
	[DeviceOrderStatus.DevicesAssigned, 2],
	[DeviceOrderStatus.Shipped, 3],
	[DeviceOrderStatus.Cancelled, 4]
]);

export const DeviceActivationRequestTypeValue = new Map<DeviceActivationRequestType, number>([
	[DeviceActivationRequestType.Status, 0],
	[DeviceActivationRequestType.Activate, 1],
	[DeviceActivationRequestType.Deactivate, 2]
]);
export const DeviceExperienceValue = new Map<DeviceExperience, number>([
	[DeviceExperience.None, 0],
	[DeviceExperience.Device, 1],
	[DeviceExperience.Mobile, 2],
	[DeviceExperience.OEM, 3]
]);
export const DeviceFeatureValue = new Map<DeviceFeature, number>([
	[DeviceFeature.Audio, 1],
	[DeviceFeature.BlueLight, 2],
	[DeviceFeature.Accelerometer, 3],
	[DeviceFeature.GPS, 4],
	[DeviceFeature.GPSToggle, 5],
	[DeviceFeature.AWSIot, 6]
]);
export const DeviceLocationValue = new Map<DeviceLocation, number>([
	[DeviceLocation.Progressive, 1],
	[DeviceLocation.Distributor, 2],
	[DeviceLocation.ShippedFromMfgtoDist, 3],
	[DeviceLocation.ShippedFromPrgtoDist, 4],
	[DeviceLocation.ShippedToCustomer, 5],
	[DeviceLocation.InVehicle, 6],
	[DeviceLocation.Unknown, 7]
]);
export const DeviceLotStatusValue = new Map<DeviceLotStatus, number>([
	[DeviceLotStatus.ShippedToDistributor, 1],
	[DeviceLotStatus.ShipmentReceivedByDistributor, 2],
	[DeviceLotStatus.AssigningDevices, 3],
	[DeviceLotStatus.UsedForTest, 4],
	[DeviceLotStatus.ShippedToManufacturer, 5],
	[DeviceLotStatus.ShipmentReceivedByManufacturer, 6],
	[DeviceLotStatus.AssignedToRMA, 7],
	[DeviceLotStatus.Storage, 8],
	[DeviceLotStatus.Obsolete, 9]
]);
export const DeviceLotTypeValue = new Map<DeviceLotType, number>([
	[DeviceLotType.Manufacturer, 1],
	[DeviceLotType.Returned, 2],
	[DeviceLotType.RMA, 3],
	[DeviceLotType.Inventory, 4]
]);
