import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { PhoneNumberPipe } from "@modules/shared/pipes/phoneNumber.pipe";

@Component({
    selector: "tmx-cs-mobile-number-edit",
    templateUrl: "./mobile-number-edit.component.html",
    styleUrls: ["./mobile-number-edit.component.scss"],
    standalone: false
})
export class MobileNumberEditComponent implements OnInit, AfterViewInit {

	@Input() model: { mobileNumber: string };
	@Input() currentMobileNumber: string;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	maxDate = new Date();

	constructor(@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any, private phoneNumberPipe: PhoneNumberPipe) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.currentMobileNumber = this.phoneNumberPipe.transform((this.currentMobileNumber || this.injectedData.data));
	}

	ngAfterViewInit(): void {
		this.controls.filter(x => !x.isDisabled).forEach(x => this.parentForm.addControl(x));
	}

}
