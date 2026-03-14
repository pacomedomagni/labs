import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, NgModel, Validators } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { Participant } from "@modules/shared/data/resources";
import { DeviceExperience, ProgramType } from "@modules/shared/data/enums";
import { HelperService } from "@modules/shared/services/helper-service/helper.service";
import { LabelService } from "@modules/shared/services/label-service/label.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { PhoneNumberPipe, VerticalStepperComponent } from "@pgr-cla/core-ui-components";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-participant-merge",
    templateUrl: "./participant-merge.component.html",
    styleUrls: ["./participant-merge.component.scss"],
    standalone: false
})
export class ParticipantMergeComponent implements OnInit, AfterViewInit {

	@Input() model: { srcParticipant: Participant; destParticipant: Participant };
	@Input() parentForm: NgForm;

	@ViewChildren(NgModel) controls: QueryList<NgModel>;
	@ViewChild(VerticalStepperComponent, { static: true }) stepper: VerticalStepperComponent;

	participants: Participant[];
	oldParticipantFormGroup: FormGroup;
	newParticipantFormGroup: FormGroup;

	private errorMap = new Map<(p1: Participant, p2: Participant) => boolean, string>([
		[this.unableToMergeIdenticalParticipants, "Participant cannot be identical to prior selection"],
		[this.unableToMergeMobile4OrGreaterParticipant, "Mobile 4.0 or greater participants can only be replaced by other mobile 4.0 or greater participants"],
		[this.unableToMergeMobileIntoPlugin, "Plug-in device participants can only be replaced by other plug-in device participants"],
		[this.unableToMergeDeviceIntoMobileIfAssigned, "Unable to merge device participant into a mobile participant if a device is assigned"],
		[this.unableToMergeBothDeviceAssigned, "Unable to merge participant because there is a device assigned to both participants"],
		[this.unableToMergeMobile3IntoHigher, "Mobile 3.0 participants can only be replaced by plug-in device participants or mobile 3.0 participants"],
		[this.unableToMergeMultipleOEM, "Unable to merge two OEM participants"]
	]);

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		public helper: HelperService,
		public labelService: LabelService,
		private query: SnapshotPolicyQuery,
		private fb: FormBuilder,
		private phoneNumberPipe: PhoneNumberPipe) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.oldParticipantFormGroup = this.fb.group({ oldParticipantCtrl: ["", Validators.required] });
		this.newParticipantFormGroup = this.fb.group({ newParticipantCtrl: ["", Validators.required] });
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			this.participants = x.participants;
		});
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

	getSummary(participant: Participant): string[] {
		if (participant) {
			return [
				this.labelService.getParticipantDisplayName(participant),
				!this.helper.isParticipantMobile(participant)
					? `Device Id: ${participant.pluginDeviceDetails?.deviceSerialNumber}`
					: `Mobile Phone #: ${this.phoneNumberPipe.transform(participant.registrationDetails?.mobileRegistrationCode)}`,
				`Part. Id: ${participant.snapshotDetails.participantId}`
			];
		}
		else {
			return [];
		}
	}

	onOldParticipantChange(participant: Participant): void {
		if (participant?.snapshotDetails.participantId === this.model.destParticipant?.snapshotDetails.participantId) {
			this.model.destParticipant = undefined;
		}
		this.stepper.next();
	}

	onNewParticipantChange(): void {
		this.stepper.next();
	}

	shouldDisableParticipant(first: Participant, second: Participant): string {
		if (first && second) {
			for (const entry of Array.from(this.errorMap.entries())) {
				const hasError = entry[0](first, second);
				if (hasError) {
					return entry[1];
				}
			}
		}
		return undefined;
	}

	unableToMergeIdenticalParticipants(first: Participant, second: Participant): boolean {
		return first.snapshotDetails.participantId === second.snapshotDetails.participantId;
	}

	unableToMergeMobile4OrGreaterParticipant(first: Participant, second: Participant): boolean {
		return first.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile &&
			first.snapshotDetails.programType >= ProgramType.PriceModel4 &&
			(
				second.snapshotDetails.enrollmentExperience !== DeviceExperience.Mobile ||
				second.snapshotDetails.programType <= ProgramType.PriceModel3
			);
	}

	unableToMergeMobileIntoPlugin(first: Participant, second: Participant): boolean {
		return first.snapshotDetails.enrollmentExperience === DeviceExperience.Device &&
			second.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile;
	}

	unableToMergeDeviceIntoMobileIfAssigned(first: Participant, second: Participant): boolean {
		if (first.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile) {
			return second.pluginDeviceDetails?.deviceSeqId !== undefined;
		}
		else {
			return false;
		}
	}

	unableToMergeBothDeviceAssigned(first: Participant, second: Participant): boolean {
		if (first.snapshotDetails.enrollmentExperience !== DeviceExperience.Mobile && second.snapshotDetails.enrollmentExperience !== DeviceExperience.Mobile) {
			const inactiveStatuses = [undefined, "", "Inactive-Abandoned", "Inactive-Recycled", "Inactive-CustomerReturn", "Inactive-Defective"];

			return !inactiveStatuses.includes(first.pluginDeviceDetails?.wirelessStatus) &&
				!inactiveStatuses.includes(second.pluginDeviceDetails?.wirelessStatus);
		}
		else {
			return false;
		}
	}

	unableToMergeMobile3IntoHigher(first: Participant, second: Participant): boolean {
		return first.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile &&
			first.snapshotDetails.programType === ProgramType.PriceModel3 &&
			second.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile &&
			second.snapshotDetails.programType >= ProgramType.PriceModel4;
	}

	unableToMergeMultipleOEM(first: Participant, second: Participant): boolean {
		return first.snapshotDetails.enrollmentExperience === DeviceExperience.OEM &&
			second.snapshotDetails.enrollmentExperience === DeviceExperience.OEM;
	}
}
