import { Policy, PolicyPeriod } from "@modules/shared/data/resources";
import { Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";

import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { ChannelIndictorValues } from "@modules/shared/data/enums";
@UntilDestroy()
@Component({
    selector: "tmx-snapshot-policy-details",
    templateUrl: "./policy-details.component.html",
    styleUrls: ["./policy-details.component.scss"],
    standalone: false
})
export class PolicyDetailsComponent implements OnInit {

	policy: Policy;
	policyTerms: PolicyPeriod[];
	selectedPolicyTerm: PolicyPeriod;
	selectedPolicySuffix: number;
	polExprHelp: HelpText;
	helpText = HelpText;

	channelIndictorValues = ChannelIndictorValues;
	private hasMobileParticipants: boolean;

	constructor(
		public helper: ResourceQuery,
		private snapshotPolicyService: SnapshotPolicyService,
		private query: SnapshotPolicyQuery) { }

	ngOnInit(): void {
		this.query.mobileParticipants$.pipe(untilDestroyed(this)).subscribe(x => this.hasMobileParticipants = x?.length > 0);
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.policy = x;
				if (this.policy.policyPeriodDetails) {
					this.policyTerms = this.policy.policyPeriodDetails;
					this.selectedPolicyTerm = this.policyTerms.find(y => this.helper.getExtender(y, "IsSelectedTerm") === true);
					this.selectedPolicySuffix = this.selectedPolicyTerm.policySuffix;
					this.polExprHelp = this.selectedPolicyTerm.expirationDate < getToday() ? HelpText.PolicyExpired : undefined;
				}
				else {
					this.policyTerms = undefined;
					this.selectedPolicyTerm = undefined;
					this.polExprHelp = undefined;
				}
			}
		});
	}

	shouldDisplayAppExperience(): boolean {
		return this.hasMobileParticipants && this.policy.snapshotDetails.appInfo.assignmentExpirationDateTime > new Date();
	}

	getAppExperienceDisplay(): string {
		switch (this.policy.snapshotDetails.appInfo.appName) {
			case "SMA":
				return "Snapshot Mobile App";
			case "MNA":
				return "Progressive Mobile App";
			default:
				return "";
		}
	}

	onTermChange(policySuffix: number): void {
		const expirationYear = this.policyTerms.find(x => x.policySuffix === policySuffix).expirationDate.getFullYear();
		this.snapshotPolicyService.searchByPolicySuffix(this.policy.policyNumber, policySuffix, expirationYear).subscribe();
	}

	channelMapper(value: string) {
		return this.channelIndictorValues.get(value);
	}
}
