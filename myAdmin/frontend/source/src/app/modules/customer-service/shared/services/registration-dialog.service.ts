import { Injectable } from "@angular/core";
import { LoadingService } from "@modules/core/services/_index";
import { ParticipantReasonCode, ParticipantStatus, ProgramCode } from "@modules/shared/data/enums";
import { Participant, Policy, Registration } from "@modules/shared/data/resources";
import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { MobileNumberEditComponent } from "../components/mobile-number-edit/mobile-number-edit.component";
import { HelpText } from "../help/metadata";
import { RegistrationService } from "./registration.service";
import { UnenrollmentParticipantComponent } from "../components/unenroll-participant/unenroll-participant.component";

@Injectable()
export class RegistrationDialogService {

	constructor(
		private registrationService: RegistrationService,
		private labelService: LabelService,
		private enums: EnumService,
		private dialogService: DialogService,
		private loadingService: LoadingService,
		private notificationService: NotificationService
	) { }

	openUnlockDialog(participant: Participant, registration: Registration, policyRefresh$: Observable<Policy>): void {
		const subtitle = participant ?
		this.labelService.getDialogSubtitleForParticipant(participant) :
		`${registration.driverFirstName} ${registration.driverLastName}`;

		this.dialogService.openConfirmationDialog({
			title: "Unlock Mobile Registration",
			subtitle,
			message: `Current status: Locked <p>New status: Unlocked</p>`,
			confirmText: "OK",
			helpKey: HelpText.MobileRegistrationUnlock
		});

		this.dialogService.confirmed().subscribe(() => {
			const successMessage = "Unlock Successful";
			this.registrationService.unlockRegistration(registration)
				.pipe(tap(_ => policyRefresh$.subscribe()))
				.subscribe(() => this.notificationService.success(successMessage));
		});
	}

	openRegistrationUpdateDialog(policyNumber: string, participant: Participant, registration: Registration, policyRefresh$: Observable<Policy>): void {
		const subtitle = participant ?
			this.labelService.getDialogSubtitleForParticipant(participant) :
			`${registration.driverFirstName} ${registration.driverLastName}`;

		this.dialogService.openFormDialog({
			title: "Change Mobile Phone Number",
			subtitle,
			component: MobileNumberEditComponent,
			formModel: { mobileNumber: undefined },
			componentData: registration.mobileRegistrationCode,
			helpKey: HelpText.MobileNumberChange
		});

		this.dialogService.confirmed<{ mobileNumber: string }>().subscribe(x => {
			this.loadingService.startLoading();
			var phoneNumber = this.unformatPhoneNumber(x.mobileNumber);
			this.registrationService.getConflictingRegistrations(phoneNumber, { async: true }).subscribe(conflictDeviceRegistrations => {
				const conflictSequenceIds: number[] = [];

				if (conflictDeviceRegistrations.length > 0) {
					let conflictProgramCode: ProgramCode;
					conflictDeviceRegistrations.forEach(
						conflictDeviceRegistration => {
							conflictProgramCode = conflictDeviceRegistration.programCode;
							conflictSequenceIds.push(conflictDeviceRegistration.mobileRegistrationSeqId);
						});

					let warningMessage = "";

					if (conflictProgramCode === ProgramCode.Trial) {
						warningMessage = `<b>The phone number entered is currently assigned<br/>to a registration in Road Test.</b><br/><br/>Are you sure you would like to inactivate the Road Test registration and assign the phone number to this policy?`;
					}
					else if (conflictProgramCode === ProgramCode.Labs) {
						warningMessage = `<b>The phone number entered is currently assigned<br/>to a registration in Internal Labs.</b><br/><br/>Are you sure you would like to inactivate the Internal Labs registration and assign the phone number to this policy?`;
					}

					this.loadingService.stopLoading();
					this.dialogService.openConfirmationDialog({
						title: "Override Non-Snapshot Registration",
						subtitle,
						message: warningMessage,
						confirmText: "OK"
					});

					this.dialogService.confirmed().subscribe(() => {
						this.updateMobileNumber(policyNumber, participant, registration, phoneNumber, conflictSequenceIds, policyRefresh$);
					});
				}
				else {
					this.updateMobileNumber(policyNumber, participant, registration, phoneNumber, conflictSequenceIds, policyRefresh$);
				}
			});
		});
	}

	private unformatPhoneNumber(phoneNumber: string ) : string {
			return phoneNumber.replace(/[()\-\s]+/g, "");
	}

	private updateMobileNumber(
		policyNumber: string,
		participant: Participant,
		registration: Registration,
		newMobileNumber: string,
		conflictSequenceIds: number[],
		policyRefresh$: Observable<Policy>): void {

		let tempParticipant = participant;

		if (tempParticipant === undefined) {
			tempParticipant = {
				snapshotDetails: {
					status: ParticipantStatus.Pending,
					reasonCode: ParticipantReasonCode.MobilePendingRegistration
				},
				registrationDetails: registration
			} as Participant;
		}

		this.loadingService.startLoading();
		this.registrationService.updateRegistrationCode(policyNumber, newMobileNumber, tempParticipant, conflictSequenceIds, { async: true })
			.pipe(tap(_ => policyRefresh$.subscribe()))
			.subscribe(() => {
				this.notificationService.success(`Change Mobile Phone Number Successful`);
				this.loadingService.stopLoading();
			});
	}

}
