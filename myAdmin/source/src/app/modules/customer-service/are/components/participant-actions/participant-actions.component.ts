import { Component, Input, OnInit } from "@angular/core";
import { AccidentDetectionDialogService, RegistrationDialogService } from "@modules/customer-service/shared/services/_index";
import { MobileRegistrationStatusSummary } from "@modules/shared/data/enums";
import { Participant, Registration } from "@modules/shared/data/resources";
import { EnumService, UserInfoService } from "@modules/shared/services/_index";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ArePolicyService } from "../../services/_index";
import { ArePolicyQuery } from "../../stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-are-participant-actions",
    templateUrl: "./participant-actions.component.html",
    styleUrls: ["./participant-actions.component.scss"],
    standalone: false
})
export class ParticipantActionsComponent implements OnInit {

	@Input() participant: Participant;
	private registration: Registration;

	constructor(
		public query: ArePolicyQuery,
		private policyService: ArePolicyService,
		private registrationDialogService: RegistrationDialogService,
		private accidentDetectionDialogService: AccidentDetectionDialogService,
		private userInfoService: UserInfoService,
		public enums: EnumService,
	) { }

	ngOnInit(): void {
		this.query.policyRegistrations$.pipe(untilDestroyed(this)).subscribe(x =>
			this.registration = x?.filter(y => y.participantExternalId === this.participant.telematicsId)[0]);
	}

	shouldDisplayUnlockRegistration(): boolean {
		return this.isOpsUsrOrAdmin() && (this.registration?.statusSummary === MobileRegistrationStatusSummary.Locked);
	}

	shouldDisplayUpdatePhoneNumber(): boolean {
		return this.isOpsUsrOrAdmin() && this.registration !== undefined;
	}

	shouldDisplayUnenrollParticipant(): boolean {
		return this.isOpsUsrOrAdmin() && this.participant.areDetails.adEnrolled;
	}

	openUnlockRegistration(): void {
		this.registrationDialogService.openUnlockDialog(this.participant, this.participant.registrationDetails, this.policyService.getPolicy(this.query.activePolicyNumber));
	}

	openUpdatePhoneNumber(): void {
		this.registrationDialogService.openRegistrationUpdateDialog(
			this.query.activePolicyNumber,
			this.participant,
			this.participant.registrationDetails,
			this.policyService.getPolicy(this.query.activePolicyNumber));
	}

	openUnenrollParticipant(): void {
		this.accidentDetectionDialogService.openUnenrollmentParticipantDialog(
			this.query.activePolicyNumber,
			this.participant,
			this.participant.registrationDetails,
			this.policyService.getPolicy(this.query.activePolicyNumber));
	}

	private isOpsUsrOrAdmin(): boolean {
		return this.userInfoService.data.isInOpsUserRole ||
			this.userInfoService.data.isInOpsAdminRole;
	}

}
