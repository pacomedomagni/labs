
export interface DeviceOrder {
    deviceOrderSeqID: number;
    orderNumber: string;

    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    orderDate?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    zipCode?: string;
    state?: string;
    deviceType?: string;
    snapshotVersion?: string;
    deviceOrderStatusDescription?: string;
    processedDateTime?: string;
    shipDateTime?: string;
    processedBy?: string;
    processedByUserID?: string;
    deviceCount?: number;
    deviceSerialNumbers?: string[];
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

export interface CompletedOrdersList {
    orders: DeviceOrder[];
    totalCount: number;
    processedByUsers: ProcessedByUser[];
}

export interface ProcessedByUser {
    userID: string;
    displayName: string;
}

export interface LabelPrinter {
    PrinterName: string;
    PrinterIP: string;
}

export interface ValidateDeviceForFulfillmentRequest {
    deviceSerialNumber: string;
}

export interface ValidateDeviceForFulfillmentResponse {
    isAvailable: boolean;
    isValid: boolean;
    isExistent: boolean;
    isBenchtested: boolean;
    isAssigned: boolean;
    benchtestingComplete: boolean;
    deviceSerialNumber: string;
}

