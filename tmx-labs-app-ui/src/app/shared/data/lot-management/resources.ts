import { Resource } from '../application/resources';

// Enums
export enum DeviceLotType {
    Manufacturer = 1,
    Returned = 2,
    RMA = 3,
    Inventory = 4
}

export enum DeviceLotStatus {
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

// Interfaces
export interface DeviceLot extends Resource {
    createDateTime?: Date;
    lotSeqID?: number;
    seqId?: number;
    name: string;
    statusCode?: number;
    status?: DeviceLotStatus;
    typeCode?: number;
    type?: DeviceLotType;
}

export interface DeviceDetails extends Resource {
    deviceSeqID: number;
    deviceSerialNumber: string;
    createDateTime: Date;
    sim?: string;
    shipDateTime?: Date;
    firstContactDateTime?: Date;
    lastContactDateTime?: Date;
    benchTestStatusCode?: number;
}

export interface GetDeviceLotsInProgressResponse extends Resource {
    deviceLots: DeviceLot[];
    deviceLotCount: number;
    requiredPercentage: number;
}

export interface GetDevicesByLotResponse extends Resource {
    devices: DeviceDetails[];
    deviceCount: number;
}

export interface CheckinRequest {
    query: string;
}

export interface VerifyBenchTestRequest {
    lotSeqId: number;
    lotType: DeviceLotType;
}

export interface DeviceUpdateResult {
    deviceSerialNumber: string;
    success: boolean;
    errorMessage?: string;
}

export interface VerifyBenchTestResponse extends Resource {
    totalDevices: number;
    successfulUpdates: number;
    failedUpdates: number;
    results: DeviceUpdateResult[];
}
