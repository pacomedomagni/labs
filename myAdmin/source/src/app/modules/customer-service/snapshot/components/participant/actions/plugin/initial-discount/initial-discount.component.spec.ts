import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { Participant } from "@modules/shared/data/resources";
import { DialogService, LabelService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { InitialDiscountComponent } from "./initial-discount.component";

function setup() {
	const deviceService = autoSpy(DeviceService);
	const dialogService = autoSpy(DialogService);
	dialogService.confirmed.mockReturnValue(of(undefined));
	const labelService = autoSpy(LabelService);
	labelService.getDialogSubtitleForParticipant.mockReturnValue("name");
	const notificationService = autoSpy(NotificationService);
	const injectedData = {} as any;
	const participant = {} as Participant;

	const builder = {
		deviceService,
		dialogService,
		labelService,
		injectedData,
		participant,
		default() {
			return builder;
		},
		build() {
			return new InitialDiscountComponent(injectedData, deviceService, dialogService, labelService, notificationService);
		}
	};

	return builder;
}

describe("InitialDiscountComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should open confirm dialog when inserting", () => {
		const { build, dialogService } = setup().default();
		const component = build();

		component.insertRecord();

		expect(dialogService.openConfirmationDialog).toHaveBeenCalled();
	});
});
