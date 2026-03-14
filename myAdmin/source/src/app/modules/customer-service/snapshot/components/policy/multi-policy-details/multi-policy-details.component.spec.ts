import { Policy } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { MultiPolicyDetailsComponent } from "./multi-policy-details.component";
import { EnumService } from "@modules/shared/services/_index";

function setup() {
	const policyService = autoSpy(SnapshotPolicyService);
	policyService.getPolicy.mockReturnValue(of({} as Policy));
	const query = autoSpy(SnapshotPolicyQuery);
	query.multiPolicy$ = of([] as Policy[]);
	const helper = autoSpy(ResourceQuery);
	const enumService = autoSpy(EnumService);
	const builder = {
		policyService,
		default() {
			return builder;
		},
		build() {
			return new MultiPolicyDetailsComponent(policyService, query, helper, enumService);
		}
	};

	return builder;
}

describe("SnapshotMultiPolicyDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should set index on select", () => {
		const { build } = setup().default();
		const component = build();

		component.selectRow(1);

		expect(component.selectedIndex).toEqual(1);
	});

	it("should select policy", () => {
		const { build, policyService } = setup().default();
		const component = build();

		component.selectPolicy("123");

		expect(policyService.getPolicy).toHaveBeenCalledWith("123");
	});
});
