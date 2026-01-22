import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren, inject } from "@angular/core";
import { FormsModule, NgForm, NgModel } from "@angular/forms";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from "@angular/material/input";
import { CustomerInfo } from "src/app/shared/data/participant/resources";
import { FORM_DIALOG_CONTENT } from "src/app/shared/components/dialogs/form-dialog/form-dialog.component";
import { States } from "src/app/shared/data/application/enums";

interface CustomerDetailsEditInjectedData {
	data: {
		appExpirationDate?: Date;
	};
	model: CustomerInfo & {
		appName?: string;
	};
	form: NgForm;
}

@UntilDestroy()
@Component({
    selector: "tmx-customer-details-edit",
    templateUrl: "./customer-details-edit.component.html",
    styleUrls: ["./customer-details-edit.component.scss"],
	imports: [
		FormsModule,
		MatFormField,
		MatLabel,
		MatError,
		MatInputModule,
		MatSelectModule
	]
})
export class CustomerDetailsEditComponent implements OnInit, AfterViewInit {

	@Input() customerDetails: CustomerInfo;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	states: string[] = [];

	public injectedData = inject<CustomerDetailsEditInjectedData>(FORM_DIALOG_CONTENT, { optional: true });

	constructor() {
		if (this.injectedData?.data.appExpirationDate === undefined ||
			this.injectedData.data.appExpirationDate < this.getToday()) {
			this.injectedData.model.appName = "";
		}
	}

	ngOnInit(): void {
		this.customerDetails = this.customerDetails || this.injectedData?.model;
		this.parentForm = this.parentForm || this.injectedData?.form;
		this.states = Object.values(States).filter(value => typeof value === "string");
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

	getToday(): Date {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		return date;
	}
}
