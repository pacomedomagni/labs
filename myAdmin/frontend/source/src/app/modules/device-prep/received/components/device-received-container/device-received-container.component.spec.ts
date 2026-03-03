import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { DevicePrepReceivedQuery } from "../../stores/received-query";
import { DeviceReceivedContainerComponent } from "./device-received-container.component";
import { DeviceReceivedService } from "../../services/device-received.service";

function setup() {
	const deviceService = autoSpy(DeviceReceivedService);
	const query = autoSpy(DevicePrepReceivedQuery);
	const notificationService = autoSpy(NotificationService);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceReceivedContainerComponent(query, notificationService, deviceService);
		}
	};

	return builder;
}

describe("DeviceReceivedContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
