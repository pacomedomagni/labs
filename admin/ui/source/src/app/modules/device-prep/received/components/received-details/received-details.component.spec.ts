import { LabelService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { DevicePrepReceivedQuery } from "../../stores/received-query";
import { ReceivedDetailsComponent } from "./received-details.component";

function setup() {
	const labelService = autoSpy(LabelService);
	const query = autoSpy(DevicePrepReceivedQuery);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ReceivedDetailsComponent(labelService, query);
		}
	};

	return builder;
}

describe("ReceivedDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
