import { Component, Input } from "@angular/core";
import { ParticipantStatus } from "@modules/shared/data/enums";
import { CommercialParticipantJunction, CommercialPolicy } from "@modules/shared/data/resources";
import { UserInfoService } from "@modules/shared/services/_index";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { MatDialog } from "@angular/material/dialog";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { BehaviorSubject } from "rxjs";
import { CommercialPolicyService } from "../../services/comm-policy.service";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { ClExcludeDateRangeComponent } from "../../dialogs/exclude-date-range/commercial-exclude-date-range.component";
import { CommercialParticipantService } from "../../services/participant.service";
import { ClReplaceDeviceComponent } from "../../dialogs/commercial-replace-device/commercial-replace-device.component";
import { ClParticipantHistoryComponent } from "../../dialogs/commercial-participant-history/commercial-participant-history.component";
import { ClConnectionTimelineComponent } from "../../dialogs/commercial/commercial-connection-timeline.component";

@UntilDestroy()
@Component({
    selector: "tmx-commercial-participant-actions",
    templateUrl: "./commercial-participant-actions.component.html",
    styleUrls: ["./commercial-participant-actions.component.scss"],
    standalone: false
})
export class CLParticipantActionsComponent {

	@Input() participant: CommercialParticipantJunction;
	@Input() policy: CommercialPolicy;
	OppositeAudio: string;
	Audio: BehaviorSubject<string> = new BehaviorSubject<string>(null);

	constructor(
		private appHelper: ResourceQuery,
		public dialog: MatDialog,
		public query: CommercialPolicyQuery,
		private policyService: CommercialPolicyService,
		private userInfoService: UserInfoService,
		private dialogService: DialogService,
		private participantService: CommercialParticipantService
	) { }

	enrolledStatus(): boolean {
		return this.participant.status === ParticipantStatus.Active ||
			this.participant.status === ParticipantStatus.Enrolled;
	}

	optedOutStatus(): boolean {
		return this.participant.status === ParticipantStatus.Unenrolled ||
			this.participant.status === ParticipantStatus.OptOut;
	}

	reEnroll(): void {
		this.dialogService.openConfirmationDialog({
			title: `ReEnroll Participant`,
			message: `Are you sure you want to Re-enroll this participant?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.reEnroll({
				policyNumber: this.policy.policyNumber,
				participantSeqId: this.participant.participantSeqId
			});
		});

	}

	excludedDateRange(): void {
		this.participantService.getExcludedDates(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Excluded Date Range",
				component: ClExcludeDateRangeComponent,
				componentData: { participantSeqId: this.participant.participantSeqId, excludedDates: x },
				width: CUI_DIALOG_WIDTH.LARGE,
				helpKey: HelpText.ExcludedDateRange
			});
		});
	}

	ping(): void {
		this.dialogService.openConfirmationDialog({
			title: `Ping Device`,
			message: `Are you sure you want to Ping this device?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.pingDevice(this.participant.serialNumber);
		});
	}

	resetDevice(): void {
		this.dialogService.openConfirmationDialog({
			title: `Reset Device`,
			message: `Are you sure you want to reset this device?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.ResetDevice(this.participant.serialNumber);
		});
	}

	optOut(): void {
		this.dialogService.openConfirmationDialog({
			title: `Opt Out`,
			message: "Are you sure you want to opt out this participant?</br></br>If the customer no longer wants to participate in the SmartTrip Program, remember to opt out all participants for the policy.",
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.optOut(this.participant.participantSeqId);
		});
	}

	audioSet(): void {
		this.dialogService.openConfirmationDialog({
			title: `Set Audio`,
			message: `Are you sure you want to change audio on this device?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.audioSet(this.participant.serialNumber, true);
		});
	}

	getAudio() {
		this.policyService.getAudio(this.participant.serialNumber).subscribe(
			o => this.Audio.next(o));
	}

	markDefective(): void {
		this.dialogService.openConfirmationDialog({
			title: `Mark Device Defective`,
			message: `Are you sure you want to mark as defective?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.markDefective(this.policy.policyNumber, this.participant.serialNumber);
		});
	}

	trackShipment(): void {
		this.dialogService.openConfirmationDialog({
			title: `Track Shipment`,
			message: `Are you sure you want to track shipment?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.trackShipment(this.participant.vehicleSeqId);
		});
	}

	markAbandon(): void {
		this.dialogService.openConfirmationDialog({
			title: `Mark Device as Abandon`,
			message: `Are you sure you want to mark this device as abandon?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.policyService.markAbandon(this.policy.policyNumber,
					this.participant.participantSeqId,
					this.participant.serialNumber);
			}
		});
	}

	activateDevice(): void {
		this.dialogService.openConfirmationDialog({
			title: `Activate Device`,
			message: `Are you sure you want to activate this device?`,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.policyService.activateDevice(this.policy.policyNumber, this.participant.serialNumber);
		});
	}

	//TODO: change
	connectionTimeline(): void {

		this.dialogService.openInformationDialog({
			title: "Connection Timeline",
			component: ClConnectionTimelineComponent,
			componentData: {
				participant: this.participant,
				policyNumber: this.policy.policyNumber
			},
			width: CUI_DIALOG_WIDTH.LARGE,
			helpKey: HelpText.ExcludedDateRange,
			hideCancelButton: true
		});

	}

	replaceDevice(isCableOrderResultInd: boolean): void {
		let dialogRef = this.dialog.open(ClReplaceDeviceComponent, {
			width: CUI_DIALOG_WIDTH.LARGE,
			data: {
				vehicleSeqId: this.participant.vehicleSeqId,
				isCableOrderInd: isCableOrderResultInd
			}
		}).beforeClosed().subscribe(result => {
			if (result != null) {
				this.policyService.replaceDevice({
					policyNumber: this.policy.policyNumber,
					participantSeqId: this.participant.participantSeqId,
					updatedHeavyTruckFlag: result.heavyTruck ?? false,
					updatedCableType: result.cableType ?? "",
					removeOptOut: result.optIn ?? true,
					policySeqId: this.policy.policySeqId,
					vehicleSeqId: this.participant.vehicleSeqId,
					isCableOrderInd : isCableOrderResultInd
				});
			}
		});
	}

	viewTrips(): void {
		this.participantService.getExcludedDates(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Trips",
				component: ClParticipantHistoryComponent,
				componentData: this.participant.participantSeqId,
				width: CUI_DIALOG_WIDTH.LARGE,
				helpKey: HelpText.ExcludedDateRange,
				hideCancelButton: true
			});
		});
	}

	shouldDisplayParticipantExcludeDateRange(): boolean {
		return this.participant.status !== ParticipantStatus.OptOut;
	}

	shouldDisplayParticipantTripSummary(): boolean {
		return this.participant.status !== ParticipantStatus.OptOut;
	}

	shouldDisplayDeviceDefective(): boolean {
		return this.userInfoService.data.isInOpsAdminRole &&
			!!this.participant.serialNumber;
	}

	shouldDisplayDeviceAbandon(): boolean {
		return this.userInfoService.data.isInOpsAdminRole &&
			!!this.participant.serialNumber &&
			!this.participant.deviceReceivedDate &&
			!this.participant.deviceAbandonedDate;
	}

	shouldDisplayAudioToggle(): boolean {
		return this.participant?.isCommunicationAllowed && !!this.participant?.serialNumber;
	}
	shouldDisplayPing(): boolean {
		return this.participant?.isCommunicationAllowed;
	}
	shouldDisplayConnectionTimeline(): boolean {
		return !!this.participant?.serialNumber;
	}

	// shouldDisplayDeviceReplace(): boolean {
	// 	return !!this.participant?.serialNumber;
	// }

	shouldDisplayActivateDevice(): boolean {
		return !!this.participant?.serialNumber;
	}

	shouldDisplayDeviceReset(): boolean {
		return this.participant?.isCommunicationAllowed && !!!this.participant?.serialNumber;
	}

	getAudioDisplay(): string {
		this.OppositeAudio = this.Audio.value === "ON" ? "Off" : "on";
		return this.Audio.value ?? "Off";
	}

	setAudioDisplay(): string {
		return this.OppositeAudio;
	}
}
