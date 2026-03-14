import { Component, Input, OnInit } from "@angular/core";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";
import { HomebaseParticipantSummaryResponse, Participant, Registration } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { MobileRegistrationStatusSummary } from "@modules/shared/data/enums";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { ArePolicyQuery } from "../../stores/_index";
import { untilDestroyed } from "@ngneat/until-destroy";

@Component({
    selector: "tmx-are-participant-details",
    templateUrl: "./participant-details.component.html",
    styleUrls: ["./participant-details.component.scss"],
    standalone: false
})
export class ParticipantDetailsComponent implements OnInit {

	@Input() participant: Participant;
	@Input() label: string;

	registration: Registration;
	homebaseSummary: HomebaseParticipantSummaryResponse;
	formats = UIFormats;
	help = HelpText;

	constructor(
		public query: ArePolicyQuery,
		public enums: EnumService) { }

	ngOnInit(): void {
		this.registration = this.participant.registrationDetails;

		this.query.homebaseParticipantsSummaries$.pipe(untilDestroyed(this)).subscribe(x =>
			this.homebaseSummary = x?.filter(y => y?.telematicsId === this.participant?.telematicsId)[0]);
	}

	isDeviceActive(): boolean {
		let isRegComplete = this.registration?.statusSummary === MobileRegistrationStatusSummary.Complete;
		let now = new Date();
		let isTncAgreed = this.participant.areDetails.accidentResponseConsentDateTime != null &&
			this.participant.areDetails.accidentResponseConsentDateTime <= now;
		const isYes = this.participant.areDetails.adEnrolled && isRegComplete && isTncAgreed;
		return isYes;
	}

	isEnrollmentStatusUnenrolled(): boolean {
		return !this.participant.areDetails.adEnrolled;
	}

}
