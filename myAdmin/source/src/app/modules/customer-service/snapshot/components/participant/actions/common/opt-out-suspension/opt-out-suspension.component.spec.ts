import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";

import { ParticipantService } from "@modules/customer-service/snapshot/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { OptOutSuspension, Participant, PluginDevice } from "@modules/shared/data/resources";
import { OptOutSuspensionEditComponent } from "@modules/customer-service/snapshot/components/_index";
import { OptOutSuspensionComponent } from "./opt-out-suspension.component";

function setup() {
	const injectedData = {};
	const diagService = autoSpy(DialogService);
	const partService = autoSpy(ParticipantService);
	const enums = autoSpy(EnumService);
	const labelService = autoSpy(LabelService);

	const builder = {
		partService,
		diagService,
		labelService,
		enums,
		default() {
			return builder;
		},
		build() {
			return new OptOutSuspensionComponent(injectedData, diagService, enums, partService, labelService);
		}
	};

	return builder;
}

describe("OptOutSuspensionComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});

describe("describe for add item", () => {
	test.each([
		{ title: "Add Suspension", subtitle: "Participant name", confirmed: {} as OptOutSuspension, seqId: 1, serialNumber: "1" }
	])
		("should open add item dialog appropriately when: %s", (data) => {
			const { build, diagService, partService, labelService } = setup().default();
			const component = build();

			diagService.confirmed.mockReturnValue(of(data.confirmed));
			partService.addOptOutSuspension.mockReturnValue(of(2));
			labelService.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
			component.participant = {
				snapshotDetails: { participantSeqId: 1 },
				pluginDeviceDetails: { deviceSeqId: data.seqId, deviceSerialNumber: data.serialNumber } as PluginDevice
			} as Participant;
			component.suspensions = [{} as OptOutSuspension];

			component.addItem();

			expect(diagService.openFormDialog).toHaveBeenCalledWith({
				title: data.title, subtitle: data.subtitle, component: OptOutSuspensionEditComponent,
				formModel: {}
			});
			expect(diagService.confirmed).toHaveBeenCalled();
			expect(partService.addOptOutSuspension).toHaveBeenCalled();
		});
});

describe("describe for delete item", () => {
	test.each([
		{ title: "Cancel Suspension(s)", subtitle: "Participant name", message: "Are you sure you want to cancel suspension(s)?", confirmed: true }
	])
		("should open delete item dialog appropriately when: %s", (data) => {
			const { build, diagService, partService, labelService } = setup().default();
			const component = build();

			diagService.confirmed.mockReturnValue(of(data.confirmed));
			partService.cancelOptOutSuspension.mockReturnValue(of());
			labelService.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
			component.suspensions = [{} as OptOutSuspension];

			component.deleteItem();

			expect(diagService.openConfirmationDialog).toHaveBeenCalledWith({ title: data.title, subtitle: data.subtitle, message: "Are you sure you want to cancel all active and pending suspension(s)?" });
			expect(diagService.confirmed).toHaveBeenCalled();
			expect(partService.cancelOptOutSuspension).toHaveBeenCalled();
		});
});
