import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { DeviceInfoComponent } from "./device-info.component";

function setup() {
	const data: any = {};
	const helper = autoSpy(ResourceQuery);

	const builder = {
		data,
		helper,
		default() {
			return builder;
		},
		build() {
			return new DeviceInfoComponent(data, helper);
		}
	};

	return builder;
}

describe("DeviceInfoComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
