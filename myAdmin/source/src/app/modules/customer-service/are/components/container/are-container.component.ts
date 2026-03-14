import { Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { fadeAnimation } from "@modules/shared/animations";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { Participant, Policy } from "@modules/shared/data/resources";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { ArePolicyService } from "../../services/are-policy.service";
import { ArePolicyQuery } from "../../stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-are-container",
    templateUrl: "./are-container.component.html",
    styleUrls: ["./are-container.component.scss"],
    animations: [fadeAnimation],
    standalone: false
})
export class AreContainerComponent implements OnInit {

	searchHasErrors = false;
	searchErrorMessage = "";
	policyData: Policy = undefined;
	disableAnimation = true;
	features = TelematicsFeatures;

	private routeData: { policyNumber: string } = { policyNumber: undefined };

	constructor(public query: ArePolicyQuery, private policyService: ArePolicyService, private router: Router, private helper: ResourceQuery) {
		this.router.events
			.pipe(
				filter(event => event instanceof NavigationEnd),
				startWith(this.router),
				map(() => this.router.getCurrentNavigation()?.extras.state),
				untilDestroyed(this)
			)
			.subscribe(x => this.routeData = { policyNumber: x?.policyNumber });
	}

	ngOnInit(): void {
		if (this.routeData.policyNumber) {
			this.policyService.getPolicy(this.routeData.policyNumber).subscribe();
		}

		this.query.policySearchHasErrors$.pipe(untilDestroyed(this)).subscribe(x => {
			this.searchHasErrors = x;
			this.searchErrorMessage = this.searchHasErrors ? this.query.primaryErrorMessage : "";
			this.updateAnimationDisablement();
		});

		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			this.policyData = x;
			this.updateAnimationDisablement();
		});
	}

	onPolicySearch(policyNumber: string): void {
		this.policyService.getPolicy(policyNumber).subscribe();
	}

	onPhoneNumberSearch(phoneNumber: string): void {
		this.policyService.getPolicyByRegistrationCode(phoneNumber).subscribe();
	}

	participantTracker = (index: number, participant: Participant) => participant.telematicsId;

	// Workaround for angular component issue #13870 (https://github.com/angular/components/issues/13870)
	private updateAnimationDisablement(): void {
		setTimeout(() => this.disableAnimation = this.policyData && !this.searchHasErrors ? false : true);
	}

}
