import { Participant } from "@modules/shared/data/resources";

import { HelperService } from "@modules/shared/services/helper-service/helper.service";
import { Injectable } from "@angular/core";
import { ProgramType } from "@modules/shared/data/enums";
import { PhoneNumberPipe } from "../../pipes/phoneNumber.pipe";

@Injectable({ providedIn: "root" })
export class LabelService {

	constructor(private helper: HelperService, private phoneFormat: PhoneNumberPipe) { }

	getParticipantDisplayName(participant: Participant): string {
		if (participant?.areDetails && !participant?.snapshotDetails) {
			return this.phoneFormat.transform(participant.registrationDetails.mobileRegistrationCode);
		}
		else {
			return participant ?
				participant.snapshotDetails?.programType <= ProgramType.PriceModel3 || participant.mobileDeviceDetails === undefined
					|| participant.mobileDeviceDetails.mobileDeviceAliasName === "" ?
					participant.snapshotDetails?.vehicleDetails.year + " " + participant.snapshotDetails?.vehicleDetails.make + " " + participant.snapshotDetails?.vehicleDetails.model :
					participant.mobileDeviceDetails.mobileDeviceAliasName : "";
		}
	}

	getDialogSubtitleForParticipant(participant: Participant): string {
		const partLabel = this.getParticipantDisplayName(participant);
		let serialNumberLabel = ``;
		if (participant.pluginDeviceDetails?.deviceSerialNumber !== undefined) {
			serialNumberLabel = `<p>${participant.pluginDeviceDetails?.deviceSerialNumber}</p>`;
		}
		return `${partLabel}` + (!this.helper.isParticipantMobile(participant) ? serialNumberLabel : ``);
	}

}
