import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { DeviceDetailsComponent } from "./device-details.component";
import { DevicePrepActivationQuery } from "../../stores/activation-query";

function setup() {
	const helper = autoSpy(ResourceQuery);
	const query = autoSpy(DevicePrepActivationQuery);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceDetailsComponent(helper, query);
		}
	};

	return builder;
}

describe("DeviceDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
