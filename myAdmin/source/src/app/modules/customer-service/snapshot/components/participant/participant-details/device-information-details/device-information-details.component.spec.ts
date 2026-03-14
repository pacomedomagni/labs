import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";

import { DeviceInformationDetailsComponent } from "./device-information-details.component";

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
			return new DeviceInformationDetailsComponent(injectedData, query);
		}
	};
	return builder;
}

describe("DeviceInformationDetails", () => {
	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
		expect(component.topColumns).toEqual(["reportedVin", "isDataCollectionAllowed", "lastRemoteResetDate"]);
		expect(component.bottomColumns).toEqual([
			"status",
			"configurationFirmwareValue",
			"configurationFirmwareFileName",
			"obd2FirmwareValue",
			"obd2FirmwareFileName",
			"cellFirmwareValue",
			"cellFirmwareFileName",
			"gpsFirmwareValue",
			"gpsFirmwareFileName",
			"mainFirmwareValue",
			"mainFirmwareFileName"]);
	});

});

