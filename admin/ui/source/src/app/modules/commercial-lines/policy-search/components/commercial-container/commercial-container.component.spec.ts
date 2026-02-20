import { Router } from "@angular/router";
import { CommercialPolicy, Policy } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { CommercialPolicyService } from "../../services/comm-policy.service";
import { CommercialPolicyQuery } from "../../stores/_index";

import { CommercialLinesContainerComponent } from "./commercial-container.component";

function setup() {

	const query = autoSpy(CommercialPolicyQuery);
	query.policySearchHasErrors$ = of(false);
	query.policy$ = of({} as Policy);

	const helper = autoSpy(ResourceQuery);
	const router = autoSpy(Router);
	Object.defineProperty(router, "events", { value: of([] as Event[]) });
	const policyService = autoSpy(CommercialPolicyService);
	policyService.getPolicy.mockReturnValue(of({} as CommercialPolicy));
	policyService.getPolicyByDeviceId.mockReturnValue(of({} as CommercialPolicy));
	policyService.getPolicyByRegistrationCode.mockReturnValue(of([] as CommercialPolicy[]));

	const builder = {
		query,
		policyService,
		router,
		helper,
		default() {
			return builder;
		},
		build() {
			return new CommercialLinesContainerComponent(query, policyService, router, helper);
		}
	};

	return builder;
}

describe("CommercialLinesContainerComponent", () => {

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
	it("should call searchBySerialNumber on policy search", () => {
		const { build, policyService } = setup().default();
		const component = build();

		component.searchBySerialNumber("123");

		expect(policyService.getPolicyByDeviceId).toHaveBeenCalledWith("123");
		expect(policyService.getPolicyByDeviceId).toHaveBeenCalledTimes(1);
	});

});
