import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";

@Component({
    selector: "tmx-snapshot-transfer-policy-selection",
    templateUrl: "./transfer-policy-selection.component.html",
    styleUrls: ["./transfer-policy-selection.component.scss"],
    standalone: false
})
export class TransferPolicySelectionComponent implements OnInit, AfterViewInit {

	@Input() model: { newPolicyNumber: string };
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

}
