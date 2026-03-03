import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { DeviceExperience } from "@modules/shared/data/enums";
import { CompatibilityAction, CompatibilityActionTaken, CompatibilityItem, CompatibilityType } from "@modules/shared/data/resources";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";

@Component({
    selector: "tmx-snapshot-compatibility-edit",
    templateUrl: "./compatibility-edit.component.html",
    styleUrls: ["./compatibility-edit.component.scss"],
    standalone: false
})
export class CompatibilityEditComponent implements OnInit, AfterViewInit {

	@Input() model: CompatibilityItem;
	@Input() deviceExperience: DeviceExperience;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	compatibilityReasons: CompatibilityType[];
	compatibilityActions: CompatibilityAction[];
	isMobile: boolean;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		public enums: EnumService,
		private query: SnapshotPolicyQuery) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.deviceExperience = this.deviceExperience || this.injectedData.data.deviceExperience;
		this.isMobile = this.deviceExperience === DeviceExperience.Mobile;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.compatibilityReasons = this.deviceExperience === DeviceExperience.Mobile ?
			this.query.compatibilityTypesMobile : this.query.compatibilityTypesPlugin;
		this.compatibilityActions = this.deviceExperience === DeviceExperience.Mobile ?
			this.query.compatibilityActionsMobile : this.query.compatibilityActionsPlugin;
	}

	ngAfterViewInit(): void {
		this.controls.filter(x => !x.isDisabled).forEach(x => this.parentForm.addControl(x));
	}

	isSelected(code: number): boolean {
		return this.model.compatibilityActionTakenXRef.find(x => x.actionTakenCode === code) !== undefined;
	}

	updateSelectedActions(code: number): void {
		if (this.isSelected(code)) {
			const index = this.model.compatibilityActionTakenXRef.findIndex(x => x.actionTakenCode === code);
			this.model.compatibilityActionTakenXRef.splice(index, 1);
		}
		else {
			this.model.compatibilityActionTakenXRef.push({ actionTakenCode: code } as CompatibilityActionTaken);
		}
	}

}
