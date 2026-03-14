import { Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { Participant, Policy } from "@modules/shared/data/resources";
import { SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { fadeAnimation } from "@modules/shared/animations";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { SnapshotPolicyQuery } from "../../stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-container",
    templateUrl: "./snapshot-container.component.html",
    styleUrls: ["./snapshot-container.component.scss"],
    animations: [fadeAnimation],
    standalone: false
})
export class SnapshotContainerComponent implements OnInit {

	searchHasErrors = false;
	searchErrorMessage = "";
	policyData: Policy = undefined;
	disableAnimation = true;
	features = TelematicsFeatures;

	private routeData: { policyNumber: string } = { policyNumber: undefined };

	constructor(public query: SnapshotPolicyQuery, private snapshotPolicyService: SnapshotPolicyService, private router: Router ) {
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
			this.snapshotPolicyService.getPolicy(this.routeData.policyNumber).subscribe();
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

	searchByPolicyNumber(policyNumber: string): void {
		this.snapshotPolicyService.getPolicy(policyNumber).subscribe();
	}

	searchByMobileIdentifier(mobileIdentifier: string): void {
		this.snapshotPolicyService.getPolicyByMobileIdentifier(mobileIdentifier).subscribe();
	}

	searchBySerialNumber(serialNumber: string): void {
		this.snapshotPolicyService.getPolicyByDeviceId(serialNumber).subscribe();
	}

	searchByPhoneNumber(phoneNumber: string): void {
		this.snapshotPolicyService.getPolicyByRegistrationCode(phoneNumber).subscribe();
	}

	participantTracker = (index: number, participant: Participant) => participant.snapshotDetails.participantSeqId;

	// Workaround for angular component issue #13870 (https://github.com/angular/components/issues/13870)
	private updateAnimationDisablement(): void {
		setTimeout(() => this.disableAnimation = this.policyData && !this.searchHasErrors ? false : true);
	}
}
