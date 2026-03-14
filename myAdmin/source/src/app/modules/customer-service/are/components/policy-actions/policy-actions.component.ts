import { Component, OnInit } from "@angular/core";
import { MobileRegistrationComponent } from "@modules/customer-service/shared/components/_index";
import { TelematicsFeaturesMenuData } from "@modules/customer-service/shared/data/models";
import { CrossAppService } from "@modules/customer-service/shared/services/cross-app.service";
import { RegistrationService } from "@modules/customer-service/shared/services/registration.service";
import { CrossAppQuery } from "@modules/customer-service/shared/stores/cross-app-query";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { Registration } from "@modules/shared/data/resources";
import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";
import { UserInfoService } from "@modules/shared/services/user-info/user-info.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { tap } from "rxjs/operators";
import { ArePolicyQuery } from "../../stores/_index";
import { ArePolicyService } from "../../services/are-policy.service";

@UntilDestroy()
@Component({
    selector: "tmx-are-policy-actions",
    templateUrl: "./policy-actions.component.html",
    styleUrls: ["./policy-actions.component.scss"],
    standalone: false
})
export class PolicyActionsComponent implements OnInit {

	public features = TelematicsFeatures;
	public availableFeatures: TelematicsFeaturesMenuData[] = [];

	private mobileRegistrations: Registration[];

	constructor(
		public query: ArePolicyQuery,
		private crossAppQuery: CrossAppQuery,
		private crossAppService: CrossAppService,
		private dialogService: DialogService,
		private userInfoService: UserInfoService,
		private registrationService: RegistrationService,
		private policyService: ArePolicyService
	) { }

	ngOnInit(): void {
		this.query.policyRegistrations$.pipe(untilDestroyed(this)).subscribe(x => this.mobileRegistrations = x);
		this.crossAppQuery.policyEnrolledFeatures$.pipe(untilDestroyed(this)).subscribe(x =>
			this.availableFeatures = this.crossAppService.getAvailableFeaturesMenuData(TelematicsFeatures.AccidentDetection, x));
	}

	shouldDisplayMobileRegistration(): boolean {
		return (this.userInfoService.data.isInOpsAdminRole ||
			this.userInfoService.data.isInOpsUserRole)
			&& this.mobileRegistrations?.length > 0;
	}

	openMobileRegistration(): void {
		this.dialogService.openInformationDialog({
			title: "Mobile Registration",
			component: MobileRegistrationComponent,
			componentData: {
				policyQuery: this.query,
				policyRefresh$: this.policyService.getPolicy(this.query.activePolicyNumber),
				registrationRefresh$: this.registrationService.getRegistrations(this.mobileRegistrations.map(x => x.participantExternalId))
					.pipe(tap(x => this.query.updatePolicyRegistrations(x)))
			},
			width: CUI_DIALOG_WIDTH.FULL
		});
	}
}
