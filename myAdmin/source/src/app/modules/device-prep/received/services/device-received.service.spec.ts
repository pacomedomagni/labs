import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { DevicePrepReceivedQuery } from "../stores/received-query";
import { DeviceReceivedService } from "./device-received.service";

function setup() {
	const api = autoSpy(ApiService);
	const query = autoSpy(DevicePrepReceivedQuery);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceReceivedService(api, query);
		}
	};

	return builder;
}

describe("DeviceReceivedService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
