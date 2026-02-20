import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { OptOutSuspension } from "@modules/shared/data/resources";
import { OptOutReasonCode } from "@modules/shared/data/enums";
import { EnumService, UserInfoService } from "@modules/shared/services/_index";
import { getToday } from "@modules/shared/utils/datetime-utils";

@Component({
    selector: "tmx-snapshot-opt-out-suspension-edit",
    templateUrl: "./opt-out-suspension-edit.component.html",
    styleUrls: ["./opt-out-suspension-edit.component.scss"],
    standalone: false
})
export class OptOutSuspensionEditComponent implements OnInit, AfterViewInit {

	@Input() model: OptOutSuspension;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	get minEndDate(): Date {
		if (this.model.startDate) {
			const date = new Date(this.model.startDate);
			date.setDate(date.getDate() + 1);
			return date;
		} else {
			return undefined;
		}
	}

	today: Date = getToday();

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		public enums: EnumService, public user: UserInfoService
	) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.model.isCancelled = false;
		this.model.isReturned = false;
		this.model.userName = this.user.data.name;
		this.model.reasonCode = OptOutReasonCode.CustomerOptOut;
		this.model.startDate = getToday();
		this.updateEndDate();
		this.parentForm = this.parentForm || this.injectedData.form;

	}

	updateEndDate(): void {
		if (this.model.startDate) {
			this.model.endDate = new Date(this.model.startDate);
			this.model.endDate.setDate(this.model.startDate.getDate() + 14);
		}
	}
	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

}

