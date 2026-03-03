import { Participant } from "@modules/shared/data/resources";

import { Injectable } from "@angular/core";
import { DeviceExperience } from "@modules/shared/data/enums";

@Injectable({ providedIn: "root" })
export class HelperService {

	constructor() { }

	isParticipantMobile(participant: Participant): boolean {
		return participant.snapshotDetails?.enrollmentExperience === DeviceExperience.Mobile ||
			participant.areDetails !== undefined;
	}

	isParticipantPlugin(participant: Participant): boolean {
		return participant.snapshotDetails.enrollmentExperience === DeviceExperience.Device;
	}

	isParticipantOEM(participant: Participant): boolean {
		return participant.snapshotDetails.enrollmentExperience === DeviceExperience.OEM;
	}

	isDeviceWithReturnDate(participant: Participant): boolean {
		return (participant.pluginDeviceDetails?.deviceReceivedDate !== undefined);
	}
}
