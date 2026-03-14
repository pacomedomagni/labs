export class TelematicsFeaturesMenuData {
	routerLink: string;
	isDisabled: boolean;
	display: string;
}

export class CableType {
	code: string;
	description: string;
}
export enum CommercialDeviceStatus {
	Connected = "Connected",
	Disconnected = "Disconnected",
	ProtocolVin = "ProtocolVin",
	OnStarBackOff = "OnStarBackOff"
}

export const CommercialDeviceStatusDescription = new Map<number, string>([
	[1, "Available"],
	[2, "Inactive"],
	[3, "Assigned"],
	[4, "Abandoned"],
	[5, "Customer Return"],
	[6, "Unavailable"],
	[7, "Defective"],
	[8, "Batched"],
	[9, "Ready For Prep"],
	[10, "Ready For BenchTest"],
	[11, "Returned By Customer Damaged"],
	[12, "Under Review"],
	[13, "Under Review - Bad"],
	[14, "Under Review - Good"],
	[15, "Needs Repair"],
	[16, "Refurbished"],
	[17, "Storage"],
	[20, "Obsolete"]
]);

export const CommercialReturnReasonDescription = new Map<number, string>([
	[1, "OptOut"],
	[2, "Cancel"],
	[3, "Non Installer"],
	[4, "Device was replaced"],
	[5, "Customer Return"],
	[6, "Device Problem"],
	[7, "Device was refused"],
	[8, "Device was unclaimed"],
	[9, "Marked Returned to Sender"],
	[10, "Device was undeliverable"],
	[11, "Abandoned"],
	[12, "Non Communicator"],
	[16, "Customer Request"]
]);

export enum CommercialDeviceOrderStatus {
	New = "New",
	DeviceAssigned = "DevicesAssigned",
	Shipped = "Shipped",
	Cancelled = "Canceled"
}

export const CommercialDeviceOrderStatusDescription = new Map<CommercialDeviceOrderStatus, string>([
	[CommercialDeviceOrderStatus.New, "New"],
	[CommercialDeviceOrderStatus.DeviceAssigned, "Devices Assigned"],
	[CommercialDeviceOrderStatus.Shipped, "Shipped"],
	[CommercialDeviceOrderStatus.Cancelled, "Canceled"]
]);

export const CommercialDeviceLocationDescription = new Map<number, string>([
	[1, "Progressive"],
	[2, "Distributor"],
	[3, "Shipped From Mfg to Dist"],
	[4, "Shipped From Prg to Dist"],
	[5, "Shipped To Customer"],
	[6, "In Vehicle"],
	[7, "Unknown"],
	[8, "Manufacturer"],
	[9, "Destroyed"],
	[10, "Shipped From Prg to Mfg"],
	[11, "Refurbished"]

]);
