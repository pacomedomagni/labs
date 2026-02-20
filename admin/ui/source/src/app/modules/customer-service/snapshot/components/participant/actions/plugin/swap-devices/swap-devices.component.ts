import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { DeviceExperience } from "@modules/shared/data/enums";
import { Participant } from "@modules/shared/data/resources";
import { LabelService } from "@modules/shared/services/_index";
import { first } from "rxjs/operators";

@Component({
    selector: "tmx-snapshot-swap-devices",
    templateUrl: "./swap-devices.component.html",
    styleUrls: ["./swap-devices.component.scss"],
    standalone: false
})
export class SwapDevicesComponent implements OnInit, AfterViewInit {

	@Input() model: { destParticipant: Participant };
	@Input() parentForm: NgForm;

	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	errorMessage = "At least two vehicles must be enrolled with a plug-in device and devices must be assigned";
	swappableParticipants: Participant[];

	private errorConditions: Array<(p1: Participant, p2: Participant) => boolean> = [
		this.unableToSwapSameParticipant,
		this.unableToSwapWithMobile,
		this.unableToSwapWithRecycledDevice,
		this.unableToSwapWithUnassignedDevice
	];

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		public labelService: LabelService,
		private query: SnapshotPolicyQuery
	) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;

		this.query.policy$.pipe(first()).subscribe(x => {
			this.swappableParticipants = x.participants.filter(p => {
				let swappable = true;
				this.errorConditions.forEach(e => swappable &&= e(this.injectedData.data.selectedParticipant, p));
				return swappable;
			});
		});
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

	unableToSwapSameParticipant(current: Participant, swap: Participant): boolean {
		return current.snapshotDetails.participantSeqId !== swap.snapshotDetails.participantSeqId;
	}

	unableToSwapWithMobile(current: Participant, swap: Participant): boolean {
		return swap.snapshotDetails.enrollmentExperience !== DeviceExperience.Mobile;
	}

	unableToSwapWithRecycledDevice(current: Participant, swap: Participant): boolean {
		return swap.pluginDeviceDetails?.deviceSerialNumber.toUpperCase().indexOf("RECYCLED") === -1;
	}

	unableToSwapWithUnassignedDevice(current: Participant, swap: Participant): boolean {
		return swap.pluginDeviceDetails !== undefined;
	}

}
