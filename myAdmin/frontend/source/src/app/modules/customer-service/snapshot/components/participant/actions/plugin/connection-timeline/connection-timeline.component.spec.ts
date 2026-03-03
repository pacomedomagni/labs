import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { ConnectionTimelineComponent } from "./connection-timeline.component";

function setup() {
	const injectedData = {} as any;
	const query = autoSpy(ResourceQuery);

	const builder = {
		injectedData,
		query,
		default() {
			return builder;
		},
		build() {
			return new ConnectionTimelineComponent(injectedData, query);
		}
	};
	return builder;
}

describe("ConnectionTimelineComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
		expect(component.topColumns).toEqual(["Disconnect Time", "Connection Time", "Disconnect Duration"]);
		expect(component.tableFooterColumns).toEqual(["Title", "Disconnected Time"]);

	});
});
