import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { BillingTransaction, UserInfo } from "@modules/shared/data/resources";
import { DialogService, LabelService, UserInfoService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { BillingDetailsComponent } from "./billing-details.component";

function setup() {
	const deviceService = autoSpy(DeviceService);
	const dialogService = autoSpy(DialogService);
	const labelService = autoSpy(LabelService);
	const notificationService = autoSpy(NotificationService);
	const query = autoSpy(SnapshotPolicyQuery);
	const userInfoService = autoSpy(UserInfoService);
	(userInfoService as any).userInfo = {} as UserInfo;

	const builder = {
		deviceService,
		dialogService,
		labelService,
		userInfoService,
		default() {
			return builder;
		},
		build() {
			return new BillingDetailsComponent(deviceService,
				dialogService,
				labelService,
				notificationService,
				query,
				userInfoService);
		}
	};

	return builder;
}

describe("BillingDetailsComponent", () => {
	const transaction: BillingTransaction = {
		amount: "50.000",
		createDate: new Date(),
		description: "",
		deviceSeqId: 1234,
		deviceSerialNumber: "5678",
		extenders: null,
		messages: null
	};

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
		expect(component.columns).toEqual(["create", "serialNumber", "type", "amount", "actions"]);
	});

	it("should open a confirmation dialog", () => {
		const { build, dialogService, labelService } = setup().default();
		const component = build();

		dialogService.confirmed.mockReturnValue(of(true));
		labelService.getDialogSubtitleForParticipant.mockReturnValue("Name");

		component.reverseFee(transaction);

		expect(dialogService.openConfirmationDialog).toHaveBeenCalledWith({
			title: "Reverse Fee",
			subtitle: "Name",
			message: `Amount $50.00 <br /> Are you sure you want to reverse the device fee? <br /> <br />

			<b>Note: If the device will continue to be used, after reversing the fee you must 'Activate' the device.</b>`
		});
	});

	it("should call feeReversal", () => {
		const { build, dialogService, deviceService } = setup().default();
		const component = build();

		dialogService.confirmed.mockReturnValue(of(true));
		component.participantSeqId = 123;
		component.expirationYear = 1;
		component.policyNumber = "123abc";
		component.policySuffix = 0;

		component.reverseFee(transaction);

		expect(deviceService.feeReversal).toHaveBeenCalled();
	});

	describe("describe for fee reversal display", () => {
		test.each([
			{ isFeeReversal: false, isFeeReversalOnly: false, expected: false },
			{ isFeeReversal: false, isFeeReversalOnly: true, expected: true },
			{ isFeeReversal: true, isFeeReversalOnly: false, expected: true }
		])
			("should display fee reversal appropriately when: %s", (data) => {
				const { build, userInfoService } = setup().default();
				userInfoService.data.isInFeeReversalRole = data.isFeeReversal;
				userInfoService.data.isInFeeReversalOnlyRole = data.isFeeReversalOnly;
				const component = build();
				const item = {
					description
						: "Fee"
				};
				const shouldDisplay = component.shouldDisplayFeeReversal(item);

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

});
