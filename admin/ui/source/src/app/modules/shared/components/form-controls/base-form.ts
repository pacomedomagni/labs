import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "../dialogs/form-dialog/form-dialog.component";
import { DateControlComponent } from "./date-control/date-control.component";
import { DateTimeControlComponent } from "./date-time-control/date-time-control.component";
import { GuidControlComponent } from "./guid-control/guid-control.component";
import { NumericControlComponent } from "./numeric-control/numeric-control.component";
import { PhoneNumberControlComponent } from "./phone-number-control/phone-number-control.component";
import { SelectControlComponent } from "./select-control/select-control.component";
import { TextControlComponent } from "./text-control/text-control.component";
 import { TimeControlComponent } from "./time-control/time-control.component";

@Component({
    template: "",
    standalone: false
})
export abstract class BaseFormComponent implements OnInit, AfterViewInit {

	@ViewChildren(DateControlComponent) dateControls: QueryList<DateControlComponent>;
	@ViewChildren(DateTimeControlComponent) dateTimeControls: QueryList<DateTimeControlComponent>;
	@ViewChildren(GuidControlComponent) guidControls: QueryList<GuidControlComponent>;
	@ViewChildren(NumericControlComponent) numericControls: QueryList<NumericControlComponent>;
	@ViewChildren(PhoneNumberControlComponent) phoneControls: QueryList<PhoneNumberControlComponent>;
	@ViewChildren(SelectControlComponent) selectControls: QueryList<SelectControlComponent>;
	@ViewChildren(TextControlComponent) textControls: QueryList<TextControlComponent>;
	@ViewChildren(TimeControlComponent) timeControls: QueryList<TimeControlComponent>;

	@Input() parentForm: NgForm;

	constructor(@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any) {

	}

	ngOnInit(): void {
		this.parentForm = this.parentForm || this.injectedData.form;
	}

	ngAfterViewInit(): void {
		this.dateControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.dateTimeControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.guidControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.numericControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.phoneControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.selectControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.textControls.forEach(x => this.parentForm.addControl(x.ngModel));
		this.timeControls.forEach(x => this.parentForm.addControl(x.ngModel));
	}
}
