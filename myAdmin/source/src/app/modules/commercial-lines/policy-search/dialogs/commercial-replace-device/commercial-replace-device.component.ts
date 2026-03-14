import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { DialogService } from "@modules/shared/services/_index";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommercialParticipantService } from "../../services/participant.service";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";

@Component({
    selector: "tmx-commercial-replace-device",
    templateUrl: "./commercial-replace-device.component.html",
    styleUrls: ["./commercial-replace-device.component.scss"],
    standalone: false
})
export class ClReplaceDeviceComponent implements OnInit {
	public myForm: FormGroup;
	@Input() vehicleSeqId: number;
	@Input() isCableOrderInd: boolean;
	heavyTruck = false;
	cableType = "";
	cableTypes = [
		{ code: "", description: "N/A" },
		{ code: "6-Pin", description: "6-Pin" },
		{ code: "9-Pin", description: "9-Pin" }
	];

	private EXCLUDED_DATE_RANGE_TITLE = "Excluded Date Range";
	canSubmit: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public injectedData: any,
		public dialog: MatDialogRef<ClReplaceDeviceComponent>,
		private dialogService: DialogService,
		private participantService: CommercialParticipantService,
		private query: CommercialPolicyQuery) {
		this.dialog = dialog;
	}

	ngOnInit(): void {
		this.myForm = new FormGroup({
			heavyTruck: new FormControl(this.heavyTruck, [() => this.checkTruckAndCable()]),
			cableType: new FormControl(this.cableType, [() => this.checkTruckAndCable()])
		});
		this.vehicleSeqId = this.vehicleSeqId || this.injectedData.vehicleSeqId;
		this.isCableOrderInd = this.isCableOrderInd || this.injectedData.isCableOrderInd;
		this.participantService.getVehicleDetails(this.vehicleSeqId).subscribe(x => {
			this.myForm.get("cableType").setValue(x?.cableType ?? "");
			this.myForm.get("heavyTruck").setValue(x?.isHeavyTruck ?? false);
		});
		this.myForm.valueChanges
			.subscribe((changedObj: any) => {
				this.canSubmit = this.myForm.valid;
			});
	}

	clearCable(heavyTruck: boolean) {
		if (heavyTruck !== true) {
			this.cableType = "";
		}
	}

	onConfirm(): void {
		this.dialog.close(
			{
				heavyTruck: this.myForm.get("heavyTruck").value,
				cableType: this.myForm.get("cableType").value
			});
	}

	onCancel(): void {
		this.dialog.close(null);
	}
	checkTruckAndCable(): ValidationErrors | null {
		const cable = this.myForm?.get("cableType")?.value;
		const truck = this.myForm?.get("heavyTruck")?.value;

		if ((cable === "" && truck) ||
			(cable !== "" && !truck)
		) {
			return {
				cableTypeNotMatching: true
			};
		}
		this.myForm?.get("heavyTruck").setErrors(null);
		this.myForm?.get("cableType").setErrors(null);
		return null;
	}
}

