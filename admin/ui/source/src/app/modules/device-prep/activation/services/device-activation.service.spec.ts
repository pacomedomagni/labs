import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { DeviceActivationService } from "./device-activation.service";
import { DevicePrepActivationQuery } from "../stores/activation-query";

function setup() {
	const api = autoSpy(ApiService);
	const query = autoSpy(DevicePrepActivationQuery);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceActivationService(api, query);
		}
	};

	return builder;
}

describe("DeviceActivationService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
