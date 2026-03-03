import { Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { fadeAnimation } from "@modules/shared/animations";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { Participant } from "@modules/shared/data/resources";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { CommercialPolicy } from "../../../../../../app/modules/shared/data/resources";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { CommercialPolicyService } from "../../services/comm-policy.service";

@UntilDestroy()
@Component({
    selector: "tmx-commercial-container",
    templateUrl: "./commercial-container.component.html",
    styleUrls: ["./commercial-container.component.scss"],
    animations: [fadeAnimation],
    standalone: false
})
export class CommercialLinesContainerComponent implements OnInit {
	searchHasErrors = false;
	searchErrorMessage = "";
	policyData: CommercialPolicy;
	disableAnimation = true;
	features = TelematicsFeatures;

	private routeData: { policyNumber: string } = { policyNumber: undefined };

	constructor(public query: CommercialPolicyQuery, private policyService: CommercialPolicyService, private router: Router, private helper: ResourceQuery) {
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
			this.policyService.getPolicy(this.routeData.policyNumber).subscribe(data =>
				this.policyData = data);
		}

		this.query.policySearchHasErrors$.pipe(untilDestroyed(this)).subscribe(x => {
			this.searchHasErrors = x;
			this.searchErrorMessage = this.searchHasErrors ? this.query.primaryErrorMessage : "";
			this.updateAnimationDisablement();
		});

		this.query.commercialPolicy$.pipe(untilDestroyed(this)).subscribe(x => {
			this.policyData = x;

			this.updateAnimationDisablement();
		});
	}

	onPolicySearch(policyNumber: string): void {
		this.policyService.getPolicy(policyNumber).subscribe();
	}

	searchBySerialNumber(serialNumber: string): void {
		this.policyService.getPolicyByDeviceId(serialNumber).subscribe();
	}

	participantTracker = (index: number, participant: Participant) => participant.telematicsId;

	// Workaround for angular component issue #13870 (https://github.com/angular/components/issues/13870)
	private updateAnimationDisablement(): void {
		setTimeout(() => this.disableAnimation = this.policyData && !this.searchHasErrors ? false : true);
	}

}
