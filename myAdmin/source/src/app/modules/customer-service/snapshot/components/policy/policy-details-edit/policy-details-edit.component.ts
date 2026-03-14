import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";

import { Address } from "@modules/shared/data/resources";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { NgForm, NgModel } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-policy-details-edit",
    templateUrl: "./policy-details-edit.component.html",
    styleUrls: ["./policy-details-edit.component.scss"],
    standalone: false
})
export class PolicyDetailsEditComponent implements OnInit, AfterViewInit {

	@Input() policyDetails: { mailingAddress: Address; appName: string };
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	isMobilePolicy: boolean;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any, query: SnapshotPolicyQuery) {

		query.mobileParticipants$.pipe(untilDestroyed(this)).subscribe(x => {
			this.isMobilePolicy = x.length > 0;
		});

		if (this.injectedData.data.appExpirationDate === undefined ||
			this.injectedData.data.appExpirationDate < getToday()) {
			this.injectedData.model.appName = "";
		}
	}

	ngOnInit(): void {
		this.policyDetails = this.policyDetails || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}
}
