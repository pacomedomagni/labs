import {
	CancelDeviceReplacementAction,
	CancelDeviceReplacementActionValue,
	DeviceExperience, DeviceExperienceValue,
	DeviceLotStatus, DeviceLotStatusValue,
	DeviceReturnReasonCode, DeviceReturnReasonCodeValue,
	MobileRegistrationStatus, MobileRegistrationStatusValue,
	MobileRegistrationStatusSummary, MobileRegistrationStatusSummaryValue,
	OptOutReasonCode, OptOutReasonCodeValue,
	ParticipantReasonCode, ParticipantReasonCodeValue,
	ParticipantStatus, ParticipantStatusValue,
	ProgramCode, ProgramCodeValue,
	ProgramType, ProgramTypeValue,
	States, StatesValue,
	StopShipmentMethod, StopShipmentMethodValue,
	TelematicsFeatures, TelematicsFeaturesValue,
	UnenrollReason, UnenrollReasonValue
} from "@modules/shared/data/enums";
import {
	CancelDeviceReplacementActionDescription,
	DeviceExperienceDescription,
	DeviceLotStatusDescription,
	DeviceReturnReasonCodeDescription,
	MobileRegistrationStatusDescription,
	MobileRegistrationStatusSummaryDescription,
	OptOutReasonCodeDescription,
	ParticipantReasonCodeDescription,
	ParticipantStatusDescription,
	ProgramCodeDescription,
	ProgramTypeDescription,
	StatesDescription,
	StopShipmentDescription,
	TelematicsFeaturesDescription,
	UnenrollReasonDescription
} from "@modules/shared/data/enum-descriptions";

import { Injectable } from "@angular/core";

export interface EnumData<T> {
	description(obj: T): string;
	value(obj: T): number;
}

export interface StateEnumData {
	description(obj: States): { abbreviation: string; name: string };
	value(obj: States): number;
}

@Injectable({ providedIn: "root" })
export class EnumService {

	deviceExperience: EnumData<DeviceExperience> = {
		description: (obj: DeviceExperience) => DeviceExperienceDescription.get(obj),
		value: (obj: DeviceExperience) => DeviceExperienceValue.get(obj)
	};

	deviceLotStatus: EnumData<DeviceLotStatus> = {
		description: (obj: DeviceLotStatus) => DeviceLotStatusDescription.get(obj),
		value: (obj: DeviceLotStatus) => DeviceLotStatusValue.get(obj)
	};

	deviceReturnReasonCode: EnumData<DeviceReturnReasonCode> = {
		description: (obj: DeviceReturnReasonCode) => DeviceReturnReasonCodeDescription.get(obj),
		value: (obj: DeviceReturnReasonCode) => DeviceReturnReasonCodeValue.get(obj)
	};

	mobileRegistrationStatus: EnumData<MobileRegistrationStatus> = {
		description: (obj: MobileRegistrationStatus) => MobileRegistrationStatusDescription.get(obj),
		value: (obj: MobileRegistrationStatus) => MobileRegistrationStatusValue.get(obj)
	};

	mobileRegistrationStatusSummary: EnumData<MobileRegistrationStatusSummary> = {
		description: (obj: MobileRegistrationStatusSummary) => MobileRegistrationStatusSummaryDescription.get(obj),
		value: (obj: MobileRegistrationStatusSummary) => MobileRegistrationStatusSummaryValue.get(obj)
	};

	optOutReasonCode: EnumData<OptOutReasonCode> = {
		description: (obj: OptOutReasonCode) => OptOutReasonCodeDescription.get(obj),
		value: (obj: OptOutReasonCode) => OptOutReasonCodeValue.get(obj)
	};

	participantReasonCode: EnumData<ParticipantReasonCode> = {
		description: (obj: ParticipantReasonCode) => ParticipantReasonCodeDescription.get(obj) + ` (${ParticipantReasonCodeValue.get(obj)})`,
		value: (obj: ParticipantReasonCode) => ParticipantReasonCodeValue.get(obj)
	};

	participantStatus: EnumData<ParticipantStatus> = {
		description: (obj: ParticipantStatus) => ParticipantStatusDescription.get(obj),
		value: (obj: ParticipantStatus) => ParticipantStatusValue.get(obj)
	};

	programCode: EnumData<ProgramCode> = {
		description: (obj: ProgramCode) => ProgramCodeDescription.get(obj),
		value: (obj: ProgramCode) => ProgramCodeValue.get(obj)
	};

	programType: EnumData<ProgramType> = {
		description: (obj: ProgramType) => ProgramTypeDescription.get(obj),
		value: (obj: ProgramType) => ProgramTypeValue.get(obj)
	};

	states: StateEnumData = {
		description: (obj: States) => StatesDescription.get(obj),
		value: (obj: States) => StatesValue.get(obj)
	};

	stopShipmentMethod: EnumData<StopShipmentMethod> = {
		description: (obj: StopShipmentMethod) => StopShipmentDescription.get(obj),
		value: (obj: StopShipmentMethod) => StopShipmentMethodValue.get(obj)
	};

	cancelDeviceReplacementAction: EnumData<CancelDeviceReplacementAction> = {
		description: (obj: CancelDeviceReplacementAction) => CancelDeviceReplacementActionDescription.get(obj),
		value: (obj: CancelDeviceReplacementAction) => CancelDeviceReplacementActionValue.get(obj)
	};

	telematicsFeatures: EnumData<TelematicsFeatures> = {
		description: (obj: TelematicsFeatures) => TelematicsFeaturesDescription.get(obj),
		value: (obj: TelematicsFeatures) => TelematicsFeaturesValue.get(obj)
	};

	unenrollReason: EnumData<UnenrollReason> = {
		description: (obj: UnenrollReason) => UnenrollReasonDescription.get(obj),
		value: (obj: UnenrollReason) => UnenrollReasonValue.get(obj)
	};

	constructor() {
	}
}
