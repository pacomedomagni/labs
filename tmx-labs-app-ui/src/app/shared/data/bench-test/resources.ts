export interface Board {
    boardID?: number;
    name: string;
    statusCode?: number;
    userID: string;
    locationCode?: number;
    endDataTime?: Date;
    startDataTime?: Date;
    count?: number;
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
