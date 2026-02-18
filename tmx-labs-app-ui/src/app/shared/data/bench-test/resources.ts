import { BenchTestBoardStatus } from "./enums";

export interface Board {
    boardID?: number;
    name: string;
    statusCode?: number | BenchTestBoardStatus;
    userID: string;
    locationCode?: number;
    endDataTime?: Date;
    startDataTime?: Date;
    deviceCount?: number;
}

export interface GetBoardsByLocationResponse {
    boards: Board[];
    resultCount: number;
}

// Board Management Request/Response types
export interface AddBenchTestBoardRequest {
    name: string;
    locationCode: number;
    userID: string;
}

export interface BenchTestBoardResponse {
    boardID: number;
    name: string;
    statusCode: number;
    userID: string;
    locationCode: number;
    endDataTime?: Date;
    startDataTime?: Date;
}

export interface UpdateBenchTestBoardRequest {
    boardId: number;
    name?: string;
    statusCode?: number;
    userID?: string;
    locationCode?: number;
}

export interface Resource {
    extenders?: Map<string, unknown>[];
    messages?: { key: string; value: unknown }[];
}

// Test Management Request/Response types
export interface AddBenchTestRequest {
    boardId: number;
    deviceSerialNumbers: string[];
}

export interface StopIfCompleteBenchTestResponse {
    isComplete: boolean;
    boardId: number;
}

export interface BenchTestBoardCollectionResponse {
    boards: Board[];
    resultCount: number;
}

export interface ValidateDeviceForBenchTestResponse {
    simActive: boolean;
    isAssigned: boolean;
}

export interface BenchTestBoardDeviceCollectionResponse{
    devices: BenchTestBoardDevice[];
    resultCount: number;
}

export interface BenchTestBoardDevice {
  deviceSerialNumber: string;
  deviceLocationOnBoard: number | null;
}

export interface BenchTestBoardDeviceStatus {
  boardID: number;
  deviceSerialNumber: string;
  benchTestStatusCode: number;
  description: string;
  displayPercent: number;
}

export interface BenchTestBoardDeviceStatusCollectionResponse {
  deviceStatuses: BenchTestBoardDeviceStatus[];
  boardStatus: BenchTestBoardStatus;
}
