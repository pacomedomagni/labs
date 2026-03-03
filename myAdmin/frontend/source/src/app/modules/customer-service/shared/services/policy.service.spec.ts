import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { PolicyQuery } from "../stores/policy-query";
import { PolicyService } from "./policy.service";
import { RegistrationService } from "./registration.service";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));

	const registrationService = autoSpy(RegistrationService);
	const policyQuery = autoSpy(PolicyQuery);
	const builder = {
		api,
		registrationService,
		policyQuery,
		default() {
			return builder;
		},
		build() {
			return new PolicyService(api, registrationService, policyQuery);
		}
	};

	return builder;
}

describe("PolicyService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
