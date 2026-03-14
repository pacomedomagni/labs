import { PolicyService } from "@modules/customer-service/shared/services/_index";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { DialogService, EnumService } from "@modules/shared/services/_index";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CrossAppService } from "../../services/cross-app.service";
import { CrossAppQuery } from "../../stores/cross-app-query";
import { PolicyQuery } from "../../stores/policy-query";

@UntilDestroy()
@Component({
    selector: "tmx-customer-service-cross-app-banner",
    templateUrl: "./cross-app-banner.component.html",
    styleUrls: ["./cross-app-banner.component.scss"],
    standalone: false
})
export class CrossAppBannerComponent implements OnChanges, OnInit {

	@Input() policyNumber: string;
	@Input() currentFeature: TelematicsFeatures;

	availableFeatures: { feature: TelematicsFeatures; label: string }[] = [];

	constructor(
		public policyQuery: PolicyQuery,
		public dialogService: DialogService,
		private service: CrossAppService,
		private policyService: PolicyService,
		private query: CrossAppQuery,
		private enumService: EnumService) {

	}

	ngOnInit(): void {
		this.policyQuery.policyTransactionError$?.subscribe();
		this.query.policyEnrolledFeatures$.pipe(untilDestroyed(this)).subscribe(x => {
			this.availableFeatures = [];

			if (x?.isEnrolledInAre && this.currentFeature !== TelematicsFeatures.AccidentDetection) {
				this.availableFeatures.push({
					feature: TelematicsFeatures.AccidentDetection,
					label: this.enumService.telematicsFeatures.description(TelematicsFeatures.AccidentDetection)
				});
			}

			if (x?.isEnrolledInSnapshot && this.currentFeature !== TelematicsFeatures.Snapshot) {
				this.availableFeatures.push({
					feature: TelematicsFeatures.Snapshot,
					label: this.enumService.telematicsFeatures.description(TelematicsFeatures.Snapshot)
				});
			}
		});

	}

	ngOnChanges(changes: SimpleChanges): void {

		if (this.isPolicyInError(changes.policyNumber.currentValue)) {
			this.query.updatePolicyEnrolledFeatures(undefined);
		}
		else if (changes.policyNumber.previousValue !== changes.policyNumber.currentValue) {
			this.fetchFeatures(changes.policyNumber.currentValue);

		}
	}

	private fetchFeatures(policyNumber: string): void {
		this.service.getPolicyEnrolledFeatures(policyNumber).subscribe();
	}

	private isPolicyInError(policyNumber: string): boolean {
		return policyNumber == null || policyNumber === "-1";
	}

	public displayTransactionDialog() {
		this.dialogService.openConfirmationDialog({
			title: `Policy has a Transaction Error!`,
			message: `Policy is under review for correction. Please do NOT submit a Remedy ticket while this banner is present. After the banner is removed, you may submit Remedy if it is still needed.`,
			confirmText: "Ok",
			hideCancelButton: true
		});

	}
}
