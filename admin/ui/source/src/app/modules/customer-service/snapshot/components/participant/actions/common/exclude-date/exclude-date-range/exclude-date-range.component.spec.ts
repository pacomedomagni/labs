import { DialogService } from "@modules/shared/services/_index";
import { ParticipantService } from "@modules/customer-service/snapshot/services/_index";
import { autoSpy } from "autoSpy";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { ExcludeDateRangeComponent } from "./exclude-date-range.component";

function setup() {
	const injectedData = {};
	const diagService = autoSpy(DialogService);
	const partService = autoSpy(ParticipantService);
	const query = autoSpy(SnapshotPolicyQuery);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ExcludeDateRangeComponent(injectedData, diagService, partService, query);
		}
	};

	return builder;
}

describe("ExcludeDateRangeComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();
		expect(component.columns).toEqual(["start", "end", "reason", "actions"]);
		expect(true).toBeTruthy();
	});
});
