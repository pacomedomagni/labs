import { Router } from "@angular/router";
import { Policy } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { ArePolicyService } from "../../services/are-policy.service";
import { ArePolicyQuery } from "../../stores/_index";

import { AreContainerComponent } from "./are-container.component";

function setup() {

	const query = autoSpy(ArePolicyQuery);
	query.policySearchHasErrors$ = of(false);
	query.policy$ = of({} as Policy);

	const helper = autoSpy(ResourceQuery);
	const router = autoSpy(Router);
	Object.defineProperty(router, "events", { value: of([] as Event[]) });
	const policyService = autoSpy(ArePolicyService);
	policyService.getPolicy.mockReturnValue(of({} as Policy));
	policyService.getPolicyByRegistrationCode.mockReturnValue(of([] as Policy[]));

	const builder = {
		query,
		policyService,
		router,
		helper,
		default() {
			return builder;
		},
		build() {
			return new AreContainerComponent(query, policyService, router, helper);
		}
	};

	return builder;
}

describe("AreContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should call getPolicy on policy search", () => {
		const { build, policyService } = setup().default();
		const component = build();

		component.onPolicySearch("123");

		expect(policyService.getPolicy).toHaveBeenCalledWith("123");
		expect(policyService.getPolicy).toHaveBeenCalledTimes(1);
	});

	it("should call getPolicyByMobileRegistrationCode on phone number search", () => {
		const { build, policyService } = setup().default();
		const component = build();

		component.onPhoneNumberSearch("1234567890");

		expect(policyService.getPolicyByRegistrationCode).toHaveBeenCalledWith("1234567890");
		expect(policyService.getPolicyByRegistrationCode).toHaveBeenCalledTimes(1);
	});

	it("should set error flags appropriately", () => {
		const { build, query } = setup().default();
		query.policySearchHasErrors$ = of(true);
		Object.defineProperty(query, "primaryErrorMessage", { value: "Error Message" });
		const component = build();

		component.ngOnInit();

		expect(component.searchHasErrors).toEqual(true);
		expect(component.searchErrorMessage).toEqual("Error Message");
	});

});
