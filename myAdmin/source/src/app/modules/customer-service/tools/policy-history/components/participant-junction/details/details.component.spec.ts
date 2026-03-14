import { DialogService, EnumService } from "@modules/shared/services/_index";

import { PolicyHistoryService } from "@modules/customer-service/tools/policy-history/services/policy-history.service";
import { autoSpy } from "autoSpy";
import { ParticipantJunctionDetailsComponent } from "./details.component";

function setup() {
	const enums = autoSpy(EnumService);
	const dialogService = autoSpy(DialogService);
	const policyHistoryService = autoSpy(PolicyHistoryService);

	const builder = {
		enums,
		dialogService,
		policyHistoryService,
		default() {
			return builder;
		},
		build() {
			return new ParticipantJunctionDetailsComponent(enums, dialogService, policyHistoryService);
		}
	};

	return builder;
}

describe("ParticipantJunctionDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
