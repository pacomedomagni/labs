import { autoSpy } from "autoSpy";
import { DeviceActivationContainerComponent } from "./device-activation-container.component";
import { DevicePrepActivationQuery } from "../../stores/activation-query";

function setup() {
	const query = autoSpy(DevicePrepActivationQuery);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceActivationContainerComponent(query);
		}
	};

	return builder;
}

describe("DeviceActivationContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
