import { DeviceService } from "@modules/customer-service/snapshot/services/_index";
import { EnumService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { DeviceHistoryComponent } from "./device-history.component";

function setup() {
	const helper = autoSpy(ResourceQuery);
	const enums = autoSpy(EnumService);
	const service = autoSpy(DeviceService);
	const builder = {
		helper,
		enums,
		service,
		default() {
			return builder;
		},
		build() {
			return new DeviceHistoryComponent(helper, enums, service);
		}
	};

	return builder;
}

describe("DeviceHistoryComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});