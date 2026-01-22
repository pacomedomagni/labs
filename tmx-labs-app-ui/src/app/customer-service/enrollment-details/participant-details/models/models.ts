import { Signal } from "@angular/core";
import { AccountParticipantSummary, AccountVehicleSummary, AccountDeviceSummary, AccountDriverSummary } from "src/app/shared/data/participant/resources";
import { VehicleEditDialogContext } from "../services/edit-vehicle/edit-vehicle.service";
import { ParticipantNicknameDialogContext } from "../services/participant-nickname/participant-nickname.service";

export interface ActionHandlerContext {
    participantResource: Signal<AccountParticipantSummary>;
    vehicleResource: Signal<AccountVehicleSummary>;
    deviceResource: Signal<AccountDeviceSummary>;
    driverResource: Signal<AccountDriverSummary>;
    displayNickname: Signal<string | null>;
    nicknameContext: Signal<ParticipantNicknameDialogContext>;
    vehicleContext: Signal<VehicleEditDialogContext>;
    onNicknameUpdate: (nickname: string | null) => void;
    onVehicleUpdate: (vehicle: AccountVehicleSummary) => void;
    onViewTripsClosed: () => void;
}

export interface ParticipantDataRow {
    label: string;
    value: string | null | undefined;
    emphasize?: boolean;
    alwaysShow?: boolean;
}