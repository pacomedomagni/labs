import { Participant, Policy, PolicyPeriod, SnapshotPolicyDetails } from "@modules/shared/data/resources";

import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { SnapshotPolicyService } from "@modules/customer-service/snapshot/services/snapshot-policy.service";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { PolicyDetailsComponent } from "./policy-details.component";

function setup() {
	const policy = {
		policyNumber: "123",
		policyPeriodDetails: [{ policySuffix: 2, expirationDate: new Date(2020, 4, 16) }] as PolicyPeriod[],
		snapshotDetails: {
			mailingAddress: {},
			groupExternalId: "456"
		} as SnapshotPolicyDetails
	} as Policy;
	const resource = autoSpy(ResourceQuery);
	const snapshotPolicyService = autoSpy(SnapshotPolicyService);
	snapshotPolicyService.updateMailingAddress.mockReturnValue(of({}));
	snapshotPolicyService.searchByPolicySuffix.mockReturnValue(of(policy));
	const query = autoSpy(SnapshotPolicyQuery);
	query.policy$ = of(policy);
	query.mobileParticipants$ = of([{} as Participant]);
	query.policyRegistrations$ = of([]);

	const builder = {
		snapshotPolicyService,
		default() {
			return builder;
		},
		build() {
			const component = new PolicyDetailsComponent(resource, snapshotPolicyService, query);
			component.ngOnInit();
			return component;
		}
	};

	return builder;
}

describe("PolicyDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should search on term change", () => {
		const { build, snapshotPolicyService } = setup().default();
		const component = build();

		component.onTermChange(2);

		expect(snapshotPolicyService.searchByPolicySuffix).toHaveBeenCalledWith("123", 2, 2020);
	});
});
