import { Policy } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { ArePolicyQuery } from "../../stores/_index";
import { PolicyDetailsComponent } from "./policy-details.component";

function setup() {
	const query = autoSpy(ArePolicyQuery);
	const helper = autoSpy(ResourceQuery);
	const builder = {
		query,
		helper,
		default() {
			return builder;
		},
		build() {
			return new PolicyDetailsComponent(query, helper);
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

	it("should subscribe to policy changes", () => {
		const { build, query } = setup().default();
		const component = build();
		query.policy$ = of({ policyNumber: "123" } as Policy);

		component.ngOnInit();

		expect(component.policy.policyNumber).toEqual("123");
	});

});
