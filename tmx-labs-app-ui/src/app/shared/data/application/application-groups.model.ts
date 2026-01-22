export enum ApplicationGroupIds {
	Portal = "Portal",
    CustomerService = "CustomerService",
	DeviceReturn = "DeviceReturn",
    DevicePreparation = "DevicePreparation",
    OrderFulfillment = "OrderFulfillment",
    UserManagement = "UserManagement",
    BusinessRDTools = "BusinessTools",
    PIDTools = "PIDTools",
    DevTools = "DevTools",
    UserTools = "UserTools",
	SingleDeviceReturn = "SingleDeviceReturn",
	ManageDeviceReturnBatches = "ManageDeviceReturnBatches",
	BenchTestHub = "BenchTestHub",
	ImportDeviceLot = "ImportDeviceLot",
	ActivateDeactivateDevices = "ActivateDeactivateDevices",
	ReceiveDevices = "ReceiveDevices",
    DeviceStagingHub = "DeviceStagingHub"
	// TODO: etc
}

export enum ApplicationRouteGuard {
	Mobile,
	Plugin,
	Trips
}

export enum ApplicationTypeIds {
	Application = "Apps",
	Tool = "Tools"
}
