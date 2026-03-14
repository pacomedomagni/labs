import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { DeviceExperience } from "@modules/shared/data/enums";
import { Participant, PluginDevice, SnapshotParticipantDetails } from "@modules/shared/data/resources";
import { LabelService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { SwapDevicesComponent } from "./swap-devices.component";

function setup() {
	const injectedData = {};
	const labelService = autoSpy(LabelService);
	const query = autoSpy(SnapshotPolicyQuery);

	const builder = {
		injectedData,
		labelService,
		query,
		default() {
			return builder;
		},
		build() {
			return new SwapDevicesComponent(injectedData, labelService, query);
		}
	};

	return builder;
}

describe("SwapDevicesComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for device initial discount display", () => {
		test.each([
			{ method: "unableToSwapSameParticipant", srcPartId: 1, destPartId: 1, expected: false },
			{ method: "unableToSwapSameParticipant", srcPartId: 1, destPartId: 2, expected: true },
			{ method: "unableToSwapWithMobile", destExperience: DeviceExperience.Mobile, expected: false },
			{ method: "unableToSwapWithMobile", destExperience: DeviceExperience.Device, expected: true },
			{ method: "unableToSwapWithRecycledDevice", serialNumber: "123_Recycled_123", expected: false },
			{ method: "unableToSwapWithRecycledDevice", serialNumber: "123", expected: true },
			{ method: "unableToSwapWithUnassignedDevice", expected: true },
			{ method: "unableToSwapWithUnassignedDevice", forceEmptyDevice: true, expected: false }
		])
			("should display device initial discount appropriately when: %s", (data) => {
				const { build } = setup().default();
				const src = {
					snapshotDetails: { participantSeqId: data.srcPartId ?? 1 } as SnapshotParticipantDetails
				} as Participant;
				const dest = {
					snapshotDetails: {
						participantSeqId: data.destPartId ?? 2,
						enrollmentExperience: data.destExperience ?? DeviceExperience.Device
					} as SnapshotParticipantDetails,
					pluginDeviceDetails: data.forceEmptyDevice ? undefined : {
						deviceSerialNumber: data.serialNumber ?? "123"
					} as PluginDevice
				} as Participant;

				const component = build();

				const result = component[data.method](src, dest);

				expect(result).toEqual(data.expected);
			});
	});
});
