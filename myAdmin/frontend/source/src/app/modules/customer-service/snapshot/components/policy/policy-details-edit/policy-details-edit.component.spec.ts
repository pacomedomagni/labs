import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { Participant } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";

import { PolicyDetailsEditComponent } from "./policy-details-edit.component";

function setup() {
	const injectedData = { data: { appExpirationDate: undefined }, model: { appName: "" } };
	const query = autoSpy(SnapshotPolicyQuery);
	query.mobileParticipants$ = of([{} as Participant]);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new PolicyDetailsEditComponent(injectedData, query);
		}
	};

	return builder;
}

describe("PolicyDetailsEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
