import { DeviceLotStatus, DeviceLotType } from "./enums";

export interface DeviceLot {
    createDate: Date;
    name: string;
    seqId: number;
    status: DeviceLotStatus;
    type: DeviceLotType;
}
