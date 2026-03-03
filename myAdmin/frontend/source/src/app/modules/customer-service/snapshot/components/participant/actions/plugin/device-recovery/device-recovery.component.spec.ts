import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { autoSpy } from "autoSpy";
import { DatePipe } from "@angular/common";
import { of } from "rxjs";
import { DeviceHistory, DeviceRecoveryItem } from "@modules/shared/data/resources";
import { QueryList } from "@angular/core";
import { DeviceRecoveryComponent } from "./device-recovery.component";

function setup() {
	const injectedData = { data: { participantSeqId: 123 } };
	const deviceService = autoSpy(DeviceService);
	const datePipe = autoSpy(DatePipe);

	const builder = {
		deviceService,
		datePipe,
		default() {
			return builder;
		},
		build() {
			return new DeviceRecoveryComponent(injectedData, deviceService, datePipe);
		}
	};

	return builder;
}

describe("DeviceRecoveryComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should ngOnit", () => {
		const { build, deviceService } = setup().default();
		const component = build();
		component.model = { recoveryItems: [], originalRecoveryItems: [] };
		deviceService.getDeviceHistory.mockReturnValue(of({ suspensionInfo: [{ startDate: new Date() }], recoveryInfo: [{}, {}] } as DeviceHistory));
		component.ngOnInit();

		expect(component.model.recoveryItems.length).toEqual(2);
		expect(component.model.originalRecoveryItems.length).toEqual(2);
	});

});

describe("disableAbandonCheckBox", () => {
	test.each([
		{ deviceRecoveryItem: { deviceReceivedDate: new Date(), isAbandoned: false } as DeviceRecoveryItem },
		{ deviceRecoveryItem: { deviceReceivedDate: undefined, isAbandoned: true } as DeviceRecoveryItem }
	])

		("should disableAbandonCheckBox", (data) => {

			const { build } = setup().default();
			const component = build();
			const result = component.disableAbandonCheckBox(data.deviceRecoveryItem);

			expect(result).toEqual(true);
		});
});

describe("disableSuspensionCheckBox", () => {
	test.each([
		{ deviceRecoveryItem: { deviceReceivedDate: undefined, isAbandoned: true } as DeviceRecoveryItem, modifiedRecoveryItem: {} as DeviceRecoveryItem },
		{ deviceRecoveryItem: { deviceReceivedDate: undefined, isSuspended: true } as DeviceRecoveryItem, modifiedRecoveryItem: {} as DeviceRecoveryItem },
		{ deviceRecoveryItem: {} as DeviceRecoveryItem, modifiedRecoveryItem: { isAbandoned: true } as DeviceRecoveryItem },
		{ deviceRecoveryItem: { deviceReceivedDate: new Date() } as DeviceRecoveryItem, modifiedRecoveryItem: {} as DeviceRecoveryItem }
	])

		("should disableSuspensionCheckBox", (data) => {

			const { build } = setup().default();
			const component = build();
			const result = component.disableSuspensionCheckBox(data.deviceRecoveryItem, data.modifiedRecoveryItem);

			expect(result).toEqual(true);
		});
});

describe("suspensionCheckBoxChanged", () => {
	test.each([
		{ $event: { checked: true }, index: 0 }
	])

		("should suspensionCheckBoxChanged", (data) => {

			const { build } = setup().default();
			const component = build();
			component.model = { recoveryItems: [{ isSuspended: false } as DeviceRecoveryItem], originalRecoveryItems: [{ isAbandoned: true } as DeviceRecoveryItem] };
			component.abandonCheckboxes = autoSpy(QueryList);

			component.suspensionCheckBoxChanged(data.$event, data.index);

			expect(component.model.recoveryItems[data.index].isSuspended).toEqual(true);
		});
});

describe("abandonCheckBoxChanged", () => {
	test.each([
		{ $event: { checked: true }, index: 0 }
	])

		("should abandonCheckBoxChanged", (data) => {

			const { build } = setup().default();
			const component = build();
			component.model = { recoveryItems: [{ isAbandoned: false } as DeviceRecoveryItem], originalRecoveryItems: [{ isSuspended: true } as DeviceRecoveryItem] };
			component.suspendCheckboxes = autoSpy(QueryList);

			component.abandonCheckBoxChanged(data.$event, data.index);

			expect(component.model.recoveryItems[data.index].isAbandoned).toEqual(true);
		});
});
