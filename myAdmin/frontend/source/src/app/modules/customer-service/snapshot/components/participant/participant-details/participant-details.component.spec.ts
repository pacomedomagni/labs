import { Participant, PluginDevice, ScoringAlgorithmData, UserInfo } from "@modules/shared/data/resources";
import { DialogService, EnumService, HelperService, LabelService, UserInfoService } from "@modules/shared/services/_index";

import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { DeviceService } from "@modules/customer-service/snapshot/services/_index";
import { of } from "rxjs";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { MobileRegistrationStatus, MobileRegistrationStatusSummary, OptOutReasonCode, ParticipantReasonCode, ParticipantStatus } from "@modules/shared/data/enums";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { DeviceInformationDetailsComponent } from "./device-information-details/device-information-details.component";
import { ParticipantDetailsComponent } from "./participant-details.component";

function setup() {
	const query = autoSpy(ResourceQuery);
	const snapshotQuery = autoSpy(SnapshotPolicyQuery);
	const helper = autoSpy(HelperService);
	const labelService = autoSpy(LabelService);
	const enums = autoSpy(EnumService);
	const userInfoService = autoSpy(UserInfoService);
	(userInfoService as any).userInfo = {} as UserInfo;
	const dialogService = autoSpy(DialogService);
	const deviceService = autoSpy(DeviceService);
	const participant = {
		snapshotDetails: {
			participantSeqId: 1
		}
	} as Participant;

	const builder = {
		query,
		snapshotQuery,
		helper,
		labelService,
		enums,
		dialogService,
		userInfoService,
		deviceService,
		participant,

		default() {
			return builder;
		},
		build() {
			const component = new ParticipantDetailsComponent(query, helper, labelService, enums, snapshotQuery, dialogService, userInfoService, deviceService);
			component.participant = participant;
			return component;
		}
	};

	return builder;
}

describe("ParticipantDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should display algorithm when available", () => {
		const { build } = setup().default();
		const component = build();
		component.participant.snapshotDetails.scoringAlgorithmData = { code: 1, description: "algorithm label"} as ScoringAlgorithmData;

		const display = component.getAlgorithmDisplay();

		expect(display).toEqual("algorithm label (1)");
	});

	it("should display UNKNOWN when algorithm unavailable", () => {
		const { build } = setup().default();
		const component = build();

		const display = component.getAlgorithmDisplay();

		expect(display).toEqual("UNKNOWN");
	});

	it("should display monitoring complete when unenrolled via opt out for participant status", () => {
		const { build } = setup().default();
		const component = build();
		component.participant.snapshotDetails.status = ParticipantStatus.Unenrolled;
		component.participant.snapshotDetails.reasonCode = ParticipantReasonCode.ParticipantOptedOut;

		const display = component.getParticipantStatusDisplay();

		expect(display).toEqual("Monitoring Complete");
	});

	it("should display participant status code when unavailable", () => {
		const { build, enums } = setup().default();
		const component = build();
		enums.participantStatus = { description: () => "participant status label", value: () => 1 };

		const display = component.getParticipantStatusDisplay();

		expect(display).toEqual("participant status label");
	});

	it("should display monitoring complete (1) when unenrolled via opt out for reason code", () => {
		const { build } = setup().default();
		const component = build();
		component.participant.snapshotDetails.status = ParticipantStatus.Unenrolled;
		component.participant.snapshotDetails.reasonCode = ParticipantReasonCode.ParticipantOptedOut;

		const display = component.getParticipantReasonCodeDisplay();

		expect(display).toEqual("Monitoring Complete (1)");
	});

	it("should display participant reason code when unavailable", () => {
		const { build, enums } = setup().default();
		const component = build();
		component.participant.snapshotDetails.status = ParticipantStatus.Active;
		enums.participantReasonCode = { description: () => "participant reason label", value: () => 1 };

		const display = component.getParticipantReasonCodeDisplay();

		expect(display).toEqual("participant reason label");
	});

	it('should display "No VIN Reported" if reported VIN undefined', () => {
		const { build } = setup().default();
		const component = build();
		component.participant = {} as Participant;

		const display = component.getReportedVinDisplay();

		expect(display).toEqual("No VIN Reported");
	});

	it("should display reported VIN if available", () => {
		const { build } = setup().default();
		const component = build();
		component.participant = { pluginDeviceDetails: { reportedVIN: "12345" } } as Participant;

		const display = component.getReportedVinDisplay();

		expect(display).toEqual("12345");
	});

	it('should display "Mobile" for device if participant is mobile', () => {
		const { build } = setup().default();
		const component = build();
		component.isParticipantMobile = true;

		const display = component.getDeviceTypeDisplay();

		expect(display).toEqual("Mobile");
	});

	it("should display empty for device if participant is plugin and no manufacturer", () => {
		const { build } = setup().default();
		const component = build();
		component.participant = { pluginDeviceDetails: { deviceManufacturer: "" } } as Participant;

		const display = component.getDeviceTypeDisplay();

		expect(display).toEqual("");
	});

	it("should display data for device if participant is plugin", () => {
		const { build } = setup().default();
		const component = build();
		component.participant = { pluginDeviceDetails: { deviceManufacturer: "manufacturer", deviceVersion: "version" } } as Participant;

		const display = component.getDeviceTypeDisplay();

		expect(display).toEqual("manufacturer version");
	});

	it("open device info dialog when selected", () => {
		const { build, deviceService, labelService, dialogService, participant } = setup().default();
		const component = build();

		component.participant = participant;
		deviceService.deviceInfoDetails.mockReturnValue(of({} as PluginDevice));
		labelService.getParticipantDisplayName.mockReturnValue("Participant name");
		component.openDeviceInfo("1234");

		expect(dialogService.openInformationDialog).toHaveBeenCalledWith({
			title: "Device Information",
			subtitle: `Vehicle: Participant name
				<p>  Device Serial#: 1234 </p>`,
			component: DeviceInformationDetailsComponent,
			componentData: {},
			width: CUI_DIALOG_WIDTH.FULL

		});
	});

	it("should triggerMobileRegistrationStatusAlert", () => {
		const { build } = setup().default();
		const component = build();
		component.participant = {
			snapshotDetails: { status: ParticipantStatus.Active, reasonCode: ParticipantReasonCode.CollectingData },
			registrationDetails: { statusSummary: MobileRegistrationStatusSummary.Disabled }
		} as Participant;

		const result = component.triggerMobileRegistrationStatusAlert();

		expect(result).toEqual(true);
	});

	it("should triggerWirelessStatusAlert", () => {
		const { build } = setup().default();
		const component = build();
		component.participant = {
			snapshotDetails: { status: ParticipantStatus.Active, reasonCode: ParticipantReasonCode.CollectingData },
			pluginDeviceDetails: { wirelessStatus: "Inactive-Abandoned" }
		} as Participant;

		const result = component.triggerWirelessStatusAlert();

		expect(result).toEqual(true);
	});

	it("should triggerOptOutReasonHelp", () => {
		const { build } = setup().default();
		const component = build();
		const mockDate = new Date();
		mockDate.setDate(mockDate.getDate() - 3);
		component.participant = {
			snapshotDetails: { optOutDetails: { reason: OptOutReasonCode.NonInstaller, date: mockDate } }
		} as Participant;

		const result = component.triggerOptOutReasonHelp();

		expect(result).toEqual(true);
	});

	describe("describe for enrollment date alert", () => {
		test.each([
			{ status: ParticipantStatus.Active, enrollmentDate: undefined, inceptionDate: new Date(2000, 1, 1), expected: HelpText.EnrollmentDateAlert },
			{ status: ParticipantStatus.Pending, enrollmentDate: undefined, inceptionDate: new Date(2000, 1, 1), expected: HelpText.EnrollmentDateAlert },
			{ status: ParticipantStatus.Inactive, enrollmentDate: undefined, inceptionDate: new Date(2000, 1, 1), expected: undefined },
			{ status: ParticipantStatus.Active, enrollmentDate: getToday(), inceptionDate: new Date(2000, 1, 1), expected: undefined },
			{ status: ParticipantStatus.Active, enrollmentDate: undefined, inceptionDate: getToday(), expected: HelpText.EnrollmentDateAlert }
		])
			("should display enrollment date appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();
				component.participant = {
					snapshotDetails: { status: data.status, enrollmentDate: data.enrollmentDate }
				} as Participant;

				const result = component.getEnrollmentDateAlert(data.inceptionDate);

				expect(result).toEqual(data.expected);
			});
	});

});

