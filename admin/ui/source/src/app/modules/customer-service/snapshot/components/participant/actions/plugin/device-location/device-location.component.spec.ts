import { GoogleMapsService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { DeviceLocationComponent } from "./device-location.component";

function setup() {
	const injectedData = {};
	const gmService = autoSpy(GoogleMapsService);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceLocationComponent(injectedData, gmService);
		}
	};

	return builder;
}

describe("DeviceLocationComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
