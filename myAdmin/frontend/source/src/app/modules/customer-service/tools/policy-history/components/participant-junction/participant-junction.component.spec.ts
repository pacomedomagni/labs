import { DialogService, LabelService } from "@modules/shared/services/_index";

import { PolicyHistoryService } from "@modules/customer-service/tools/policy-history/services/policy-history.service";
import { autoSpy } from "autoSpy";
import { ParticipantJunctionComponent } from "./participant-junction.component";

function setup() {
	const labelService = autoSpy(LabelService);
	const dialogService = autoSpy(DialogService);
	const policyHistoryService = autoSpy(PolicyHistoryService);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ParticipantJunctionComponent(labelService, dialogService, policyHistoryService);
		}
	};

	return builder;
}

describe("ParticipantJunctionComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
