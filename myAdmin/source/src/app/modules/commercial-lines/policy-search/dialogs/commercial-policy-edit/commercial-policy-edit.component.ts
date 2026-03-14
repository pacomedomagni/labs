import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators, ValidationErrors } from "@angular/forms";
import { DialogService } from "@modules/shared/services/_index";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommercialPolicy } from "@modules/shared/data/resources";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { CommercialPolicyService } from "../../services/comm-policy.service";

@Component({
    selector: "tmx-commercial-policy-edit",
    templateUrl: "./commercial-policy-edit.component.html",
    styleUrls: ["./commercial-policy-edit.component.scss"],
    standalone: false
})

@UntilDestroy()
export class CommercialPolicyEditComponent implements OnInit {
	myForm: FormGroup;
	@Input() policy: CommercialPolicy;

	canSubmit = true;

	constructor(
		@Inject(MAT_DIALOG_DATA) public injectedData: any,
		public dialog: MatDialogRef<CommercialPolicyEditComponent>,
		private dialogService: DialogService,
		private policyService: CommercialPolicyService,
		private query: CommercialPolicyQuery) {
		this.dialog = dialog;

	}

	ngOnInit(): void {
		this.policy = this.policy || this.injectedData.policy;
		this.query.commercialPolicy$.pipe(untilDestroyed(this))
			.subscribe(p => {
				this.policy = p;
				this.myForm = new FormGroup({
					name: new FormControl(this.policy.address.contactName
						, [Validators.required]),
					address1: new FormControl(this.policy.address.address1
						, Validators.required),
					address2: new FormControl(this.policy.address.address2),
					city: new FormControl(this.policy.address.city
						, Validators.required),
					state: new FormControl(this.policy.address.state
						, Validators.required),
					zip: new FormControl(this.policy.address.zipCode
						, Validators.required),
					email: new FormControl(this.policy.emailAddress, [Validators.email]),
					sendDashboard: new FormControl(this.policy.sendDashboard)
				});
			});

	}
	checkEmptyPolicyNumber(): ValidationErrors {
		return null;
	}

	onConfirm(): void {
		this.dialog.close(
			{
				...this.myForm.value,
				policySeqId: this.policy.policySeqId
			});
	}

	onCancel(): void {
		this.dialog.close(null);
	}
}

