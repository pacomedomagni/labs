
export interface DeviceOrder {
    deviceOrderSeqID: number;
    nbrDevicesNeeded: number;
    name: string;
    email: string;
    orderNumber: string;
    orderDate: string;
    state: string;
    deviceType: string;
    snapshotVersion: string;
    deviceOrderStatusDescription: string;
}

export interface OrderListDetails {
    deviceOrders: DeviceOrder[];
    deviceOrderStatusCode: number;
    numberOfOrders: number;
    numberOfDevices: number;
    participantGroupTypeCode?: number;
    canOnlyViewOrdersForOwnGroup: boolean;
}

export interface OrderDetails {
     customerName: string;
     email: string;
     fulfilledByUserID: string;
     deviceOrderSeqID: number;
     participantGroupSeqID: number;
     devicesAssigned: boolean;
     hasErrors: boolean;
     deviceTypes: DeviceType[];
     mobileOSNames: string[];
     vehicles: MyScoreVehicle[];
}

export interface DeviceType {
    deviceTypeCode: number;
    description: string;
}

export interface MyScoreVehicle {
    year: number;
    make: string;
    model: string;
    message: string;
    deviceOrderDetailSeqID: number;
    participantSeqID: number;
    deviceTypeSelected: number;
    newDeviceSerialNumber: string;
    newDeviceRegistrationKey: string; // this field is an email address
    mobileOSName: string;
    mobileDeviceModelName: string;
    mobileOSVersionName: string;
    mobileAppVersionName: string;
}

export interface Orders {
	searchOrderNumber: string;
	searchBeginDate: string;
	searchEndDate: string;
	openSnapshotOrders: number;
	processedSnapshotOrders: number;
	snapshotDevicesNeeded: number;
}

export interface AssingDeviceRequest {
    myScoreVehicle: MyScoreVehicle;
    orderDetails: OrderDetails;
}

