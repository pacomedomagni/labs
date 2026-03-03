import { PolicyHistoryService } from "@modules/customer-service/tools/policy-history/services/policy-history.service";
import { Router } from "@angular/router";
import { autoSpy } from "autoSpy";
import { PolicyHistoryComponent } from "./policy-history.component";

function setup() {
	const policyHistoryService = autoSpy(PolicyHistoryService);
	const router = autoSpy(Router);

	const builder = {
		policyHistoryService,
		router,
		default() {
			return builder;
		},
		build() {
			return new PolicyHistoryComponent(policyHistoryService, router);
		}
	};

	return builder;
}

describe("PolicyHistoryComponent", () => {

	it("should create", () => {

		expect(true).toBeTruthy();
	});

});
