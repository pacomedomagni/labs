import { Component, Input } from "@angular/core";
import { RegistrationService } from "@modules/customer-service/shared/services/registration.service";
import { CommercialPolicy } from "@modules/shared/data/resources";
import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";
import { UserInfoService } from "@modules/shared/services/user-info/user-info.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { MatDialog } from "@angular/material/dialog";
import { CommercialPolicyService } from "../../services/comm-policy.service";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { CommercialPolicyEditComponent } from "../../dialogs/commercial-policy-edit/commercial-policy-edit.component";

@UntilDestroy()
@Component({
    selector: "tmx-commercial-policy-actions",
    templateUrl: "./commercial-policy-actions.component.html",
    styleUrls: ["./commercial-policy-actions.component.scss"],
    standalone: false
})
export class CLPolicyActionsComponent {

	@Input() policy: CommercialPolicy;

	constructor(
		public query: CommercialPolicyQuery,
		public dialog: MatDialog,
		private dialogService: DialogService,
		private userInfoService: UserInfoService,
		private registrationService: RegistrationService,
		private policyService: CommercialPolicyService
	) { }

	openPolicyEdit(): void {
		let dialogRef = this.dialog.open(CommercialPolicyEditComponent, {
			width: CUI_DIALOG_WIDTH.SMALL,
			data: {
				policy: this.policy
			}
		}).beforeClosed().subscribe(result => {
			if (result != null) {

				this.policyService.policyUpdate(
					{
						policySeqId: result.policySeqId,
						policyNumber: result.policyNumber,
						address: {
							address1: result.address1,
							address2: result.address2,
							city: result.city,
							contactName: result.name,
							state: result.state,
							zipCode: result.zip,
							extenders: null,
							messages: null
						},
						emailAddress: result.email,
						sendDashboard: result.sendDashboard,
						participants: null,
						createdDate: null
					}
				);
			}
		});
	}
}
