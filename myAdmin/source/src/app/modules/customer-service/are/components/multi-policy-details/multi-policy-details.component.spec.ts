import { Policy } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { MultiPolicyDetailsComponent } from "./multi-policy-details.component";
import { ArePolicyService } from "../../services/are-policy.service";
import { ArePolicyQuery } from "../../stores/_index";
import { EnumService } from "@modules/shared/services/_index";

function setup() {
	const policyService = autoSpy(ArePolicyService);
	policyService.getPolicy.mockReturnValue(of({} as Policy));
	const query = autoSpy(ArePolicyQuery);
	query.multiPolicy$ = of([] as Policy[]);
	const enumService = autoSpy(EnumService);
	const builder = {
		policyService,
		default() {
			return builder;
		},
		build() {
			return new MultiPolicyDetailsComponent(policyService, query, enumService);
		}
	};

	return builder;
}

describe("AreMultiPolicyDetailsComponent", () => {

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
