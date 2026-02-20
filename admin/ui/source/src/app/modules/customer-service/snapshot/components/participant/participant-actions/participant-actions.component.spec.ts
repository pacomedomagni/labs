import { CompatibilityItem, MobileDevice, Registration, OptOutSuspension, Participant, PluginDevice, Policy, TripSummary, UserInfo, AppInfo, PolicyPeriod, SnapshotPolicyDetails, SnapshotParticipantDetails } from "@modules/shared/data/resources";
import { DeviceExperience, DeviceFeature, MobileRegistrationStatusSummary, ParticipantReasonCode, ParticipantStatus, ProgramType } from "@modules/shared/data/enums";
import { DeviceService, MobileService, ParticipantService, SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { DialogService, EnumService, HelperService, LabelService, UserInfoService } from "@modules/shared/services/_index";
import { SpyOf, autoSpy } from "autoSpy";
import { of } from "rxjs";

import { ChangeDetectorRef } from "@angular/core";
import { CUI_DIALOG_WIDTH, NotificationService } from "@pgr-cla/core-ui-components";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { take } from "rxjs/operators";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { RegistrationDialogService } from "@modules/customer-service/shared/services/registration-dialog.service";
import { RegistrationService } from "@modules/customer-service/shared/services/registration.service";
import { ParticipantActionsComponent } from "./participant-actions.component";
import { EnrollmentDate20Component, EnrollmentDateComponent, TripSummaryComponent } from "../../_index";
import { UpdateGuidComponent } from "../actions/common/update-guid/update-guid.component";
import { SwapDriverComponent } from "../actions/mobile/swap-driver/swap-driver.component";
import { StopShipmentComponent } from "../actions/plugin/stop-shipment/stop-shipment.component";
import { DeviceRecoveryComponent } from "../actions/plugin/device-recovery/device-recovery.component";
import { OptOutSuspensionComponent } from "../actions/common/opt-out-suspension/opt-out-suspension.component";

function setup() {

	const resourceQuery = autoSpy(ResourceQuery);
	const changeDetection = {} as ChangeDetectorRef;
	const deviceService = autoSpy(DeviceService);
	const dialogService = autoSpy(DialogService);
	const helper = autoSpy(HelperService);
	const label = autoSpy(LabelService);
	const mobileService = autoSpy(MobileService);
	const enumService = autoSpy(EnumService);
	const notificationService = autoSpy(NotificationService);
	const participantService = autoSpy(ParticipantService);
	const userInfoService = autoSpy(UserInfoService);
	(userInfoService as any).userInfo = {} as UserInfo;
	const query = autoSpy(SnapshotPolicyQuery);
	query.policyRegistrations$ = of([]);
	const registrationService = autoSpy(RegistrationService);
	const registrationDialogService = autoSpy(RegistrationDialogService);
	const policyService = autoSpy(SnapshotPolicyService);

	const builder = {
		resourceQuery,
		helper,
		query,
		userInfoService,
		dialogService,
		mobileService,
		enumService,
		deviceService,
		notificationService,
		label,
		participantService,
		registrationDialogService,
		registrationService,
		policyService,
		default() {
			return builder;
		},
		build() {
			return new ParticipantActionsComponent(
				resourceQuery,
				changeDetection,
				registrationService,
				registrationDialogService,
				deviceService,
				dialogService,
				enumService,
				helper,
				label,
				mobileService,
				notificationService,
				participantService,
				userInfoService,
				query,
				policyService);
		}
	};

	return builder;
}

interface TestSetupInfo {
	component: ParticipantActionsComponent;
	helper: SpyOf<HelperService>;
	query: SpyOf<SnapshotPolicyQuery>;
	resourceQuery: SpyOf<ResourceQuery>;
	appName?: string;
	participantExperience: DeviceExperience;
	participantProgram?: ProgramType;
	participantStatus?: ParticipantStatus;
	participantReason?: ParticipantReasonCode;
	isMaxPolicyPeriod?: boolean;
	policyNumber?: string;
	policySuffix?: number;
	participantCount?: number;
	mobileRegistrationCompleteCount?: number;
	termExpirationDate?: Date;
}

function testSetup({
	component,
	helper,
	query,
	resourceQuery,
	participantExperience,
	appName = "SMA",
	participantProgram = ProgramType.PriceModel3,
	participantStatus = ParticipantStatus.Active,
	participantReason = ParticipantReasonCode.CollectingData,
	isMaxPolicyPeriod = true,
	policyNumber = "123",
	policySuffix = 0,
	participantCount = 1,
	mobileRegistrationCompleteCount = 1,
	termExpirationDate }: TestSetupInfo): void {

	component.participant = {
		...component.participant,
		telematicsId: "1",
		registrationDetails: {} as Registration,
		snapshotDetails:
			{
				enrollmentExperience: participantExperience,
				programType: participantProgram
			} as SnapshotParticipantDetails
	};
	if (component.participant.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile) {
		component.participant.mobileDeviceDetails = {} as MobileDevice;
	}
	else {
		component.participant.pluginDeviceDetails = { deviceSerialNumber: "12FXK32", wirelessStatus: "Active-InVehicle" } as PluginDevice;
	}
	component.participant.snapshotDetails.status = participantStatus;
	component.participant.snapshotDetails.reasonCode = participantReason;
	resourceQuery.getExtender.mockReturnValue(isMaxPolicyPeriod);
	helper.isParticipantMobile.mockReturnValue(participantExperience === DeviceExperience.Mobile ? true : false);
	helper.isParticipantOEM.mockReturnValue(participantExperience === DeviceExperience.OEM ? true : false);
	helper.isParticipantPlugin.mockReturnValue(participantExperience === DeviceExperience.Device ? true : false);
	query.policy$ = of({
		policyPeriodDetails: [{ expirationDate: termExpirationDate, policySuffix } as PolicyPeriod],
		snapshotDetails: {
			appInfo: { appName } as AppInfo
		} as SnapshotPolicyDetails,
		policyNumber,
		participants: createParticipants(component.participant, participantCount, mobileRegistrationCompleteCount)
	} as Policy);

	component.ngOnInit();
	component.ngOnChanges();
}

function createParticipants(selectedParticipant: Participant, count: number, mobileRegCompleteCount: number): Participant[] {
	let participants = [];
	participants.push(selectedParticipant);
	for (let i = 1; i < count; i++) {
		let participant = {
			telematicsId: i.toString(),
			registrationDetails: {} as Registration,
			snapshotDetails: {
				enrollmentExperience: selectedParticipant.snapshotDetails.enrollmentExperience
			} as SnapshotParticipantDetails
		} as Participant;

		if (selectedParticipant.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile) {
			participant.mobileDeviceDetails = {} as MobileDevice;
		}
		else {
			participant.pluginDeviceDetails = { deviceSerialNumber: "12FXK32", wirelessStatus: "Active-InVehicle" } as PluginDevice;
		}

		participants.push(participant);
	}

	for (let i = 0; i < mobileRegCompleteCount; i++) {
		participants[i].registrationDetails.statusSummary = MobileRegistrationStatusSummary.Complete;
	}

	return participants;
}

describe("ParticipantActionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for participant exclude date display", () => {
		test.each([
			{ isMax: true, isTheftOnly: false, expected: true },
			{ isMax: true, isTheftOnly: true, expected: false },
			{ isMax: false, isTheftOnly: false, expected: false },
			{ isMax: false, isTheftOnly: true, expected: false }
		])
			("should display participant exclude date range appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMax
				});
				userInfoService.data.isInTheftOnlyRole = data.isTheftOnly;

				const shouldDisplay = component.shouldDisplayParticipantExcludeDateRange();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for participant ubi value display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: true, experience: DeviceExperience.OEM, expected: false },
			{ isMaxAndNotTheftOnly: false, experience: DeviceExperience.Mobile, expected: false },
			{ isMaxAndNotTheftOnly: true, experience: DeviceExperience.Mobile, expected: true },
			{ isMaxAndNotTheftOnly: true, experience: DeviceExperience.Device, expected: true }
		])
			("should display participant ubi value: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();

				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: data.experience,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly
				});

				component.participant.pluginDeviceDetails = { deviceVersion: "onstar" } as PluginDevice;

				const shouldDisplay = component.shouldDisplayParticipantUbiValue();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for participant opt out display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ experience: DeviceExperience.OEM, expected: false },
			{ optOut: false, expected: false },
			{
				participantReasonCodes: [
					ParticipantReasonCode.ParticipantOptedOut
				], expected: false
			},
			{
				participantReasonCodes: [
					ParticipantReasonCode.CollectingData
				], expected: true
			},
			{
				participantReasonCodes: [
					ParticipantReasonCode.NeedsDeviceAssigned
				], expected: false
			},
			{
				participantReasonCodes: [
					ParticipantReasonCode.MobilePendingRegistration
				],
				deviceSeqId: null,
				expected: false
			},
			{
				participantReasonCodes: [
					ParticipantReasonCode.MobilePendingRegistration
				],
				deviceSeqId: "1234",
				expected: true
			}
		])
			("should display participant opt out: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();

				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: data.experience ?? DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				component.participant.snapshotDetails.reasonCode = ParticipantReasonCode.ParticipantOptedOut;
				userInfoService.data.hasOptOutSuspensionAccess = data.optOut ?? true;

				if (data.participantReasonCodes) {
					data.participantReasonCodes.forEach(x => {
						component.participant.snapshotDetails.reasonCode = x;
						if (data.deviceSeqId) {
							component.participant.mobileDeviceDetails.deviceSeqId = 1234;
						}
						const shouldDisplay = component.shouldDisplayParticipantOptOutSuspension();
						expect(shouldDisplay).toEqual(data.expected);
					});
				}
				else {
					const shouldDisplay = component.shouldDisplayParticipantOptOutSuspension();
					expect(shouldDisplay).toEqual(data.expected);
				}

			});
	});

	describe("describe for open opt out suspension", () => {
		test.each([
			{ title: "Opt Out Suspension", subtitle: "Participant name" }
		])
			("should open modal for device recovery", (data) => {
				const { build, helper, query, resourceQuery, dialogService, label, participantService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device
				});

				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
				participantService.getOptOutSuspensions.mockReturnValue(of([{} as OptOutSuspension]));

				component.openParticipantOptOutSuspensionDialog();

				expect(dialogService.openInformationDialog).toHaveBeenCalledWith({
					title: data.title,
					subtitle: data.subtitle,
					component: OptOutSuspensionComponent,
					componentData: { participant: component.participant, suspensions: [{} as OptOutSuspension] },
					width: CUI_DIALOG_WIDTH.LARGE,
					helpKey: HelpText.OptOutSuspension
				});

				expect(participantService.getOptOutSuspensions).toHaveBeenCalled();

			});
	});

	describe("describe for participant renewal score display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ isAdmin: false, expected: false },
			{ expected: true }
		])
			("should display participant renewal score appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				userInfoService.data.isInOpsAdminRole = data.isAdmin ?? true;

				const shouldDisplay = component.shouldDisplayParticipantRenewalScores();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for participant trip summary display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ expected: true }
		])
			("should display participant trip summary appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				const shouldDisplay = component.shouldDisplayParticipantTripSummary();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for open participant trip summary display", () => {
		test.each([
			{ title: "Trip Summary", subtitle: "Participant name" }
		])
			("should display participant trip summary appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, participantService, label, dialogService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile
				});

				participantService.getTripSummary.mockReturnValue(of({} as TripSummary));
				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);

				component.openParticipantTripSummary();

				expect(participantService.getTripSummary).toHaveBeenCalled();
				expect(dialogService.openInformationDialog).toHaveBeenCalledWith({
					title: data.title,
					subtitle: data.subtitle,
					component: TripSummaryComponent,
					componentData: { algorithm: undefined, data: {}, isMobile: true },
					width: CUI_DIALOG_WIDTH.FULL,
					helpKey: HelpText.TripSummary
				});
			});
	});

	describe("describe for participant guid update display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ guidUpdate: false, expected: false },
			{ expected: true }
		])
			("should display participant guid update appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				userInfoService.data.hasUpdatePProGuidAccess = data.guidUpdate ?? true;

				const shouldDisplay = component.shouldDisplayParticipantUpdatePProGuid();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for open participant guid update display", () => {
		test.each([
			{ title: "Update PolicyPro Guid", subtitle: "Participant name", confirm: true }
		])
			("should open modal for updating participant ppro guid", (data) => {
				const { build, helper, query, resourceQuery, dialogService, label, participantService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile
				});

				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
				dialogService.confirmed.mockReturnValue(of(data.confirm));

				component.openParticipantUpdatePProGuidDialog();

				expect(dialogService.openFormDialog).toHaveBeenCalledWith({
					title: data.title,
					subtitle: data.subtitle,
					component: UpdateGuidComponent,
					formModel: { guid: undefined },
					componentData: { participant: component.participant },
					width: CUI_DIALOG_WIDTH.MEDIUM
				});

				expect(dialogService.openConfirmationDialog).toHaveBeenCalled();
				expect(participantService.updatePproGuid).toHaveBeenCalled();
			});
	});

	describe("describe for open stop shipment", () => {
		test.each([
			{ title: "Stop Shipment", subtitle: "Participant name", confirm: true }
		])
			("should open modal for stop shipment", (data) => {
				const { build, helper, query, resourceQuery, dialogService, label, deviceService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile
				});

				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
				dialogService.confirmed.mockReturnValue(of(data.confirm));
				deviceService.stopShipment.mockReturnValue(of({}));
				component.openStopShipmentDialog();

				expect(dialogService.openFormDialog).toHaveBeenCalledWith({
					title: data.title,
					subtitle: data.subtitle,
					component: StopShipmentComponent,
					formModel: { stopShipmentMethod: undefined },
					helpKey: HelpText.StopShipment
				});
			});
	});

	describe("describe for open device recovery", () => {
		test.each([
			{ title: "Device Recovery", subtitle: "Participant name", confirm: { originalRecoveryItems: [{ isAbandoned: false, isSuspended: false, deviceSeqId: [] }], recoveryItems: [{ isAbandoned: true, isSuspended: false }] }, expectedResult: "abandon" },
			{ title: "Device Recovery", subtitle: "Participant name", confirm: { originalRecoveryItems: [{ isAbandoned: false, isSuspended: false, deviceSeqId: [123] }], recoveryItems: [{ isAbandoned: false, isSuspended: true }] }, expectedResult: "suspend" }
		])
			("should open modal for device recovery", (data) => {
				const { build, helper, query, resourceQuery, dialogService, label, deviceService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device
				});

				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
				dialogService.confirmed.mockReturnValue(of(data.confirm));
				deviceService.abandonDevice.mockReturnValue(of({}));
				deviceService.suspendDevice.mockReturnValue(of({}));
				component.participant.snapshotDetails.participantSeqId = 1234;

				component.openDeviceRecoveryDialog();

				expect(dialogService.openFormDialog).toHaveBeenCalledWith({
					title: data.title,
					subtitle: data.subtitle,
					component: DeviceRecoveryComponent,
					formModel: { recoveryItems: undefined, originalRecoveryItems: undefined },
					componentData: { participantSeqId: component.participant.snapshotDetails.participantSeqId },
					width: CUI_DIALOG_WIDTH.LARGE,
					helpKey: HelpText.DeviceRecovery
				});

				expect(dialogService.openFormDialog).toHaveBeenCalled();
				if (data.expectedResult === "abandon") {
					expect(deviceService.abandonDevice).toHaveBeenCalled();
				} else if (data.expectedResult === "suspend") {
					expect(deviceService.suspendDevice).toHaveBeenCalled();
				}
			});
	});

	describe("describe for participant change enrollment display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ experience: DeviceExperience.OEM, expected: false },
			{ resetEnrollment: false, expected: false },
			{
				participantReasonCodes: [
					ParticipantReasonCode.ParticipantOptedOut
				], expected: false
			},
			{
				participantReasonCodes: [
					ParticipantReasonCode.AutomatedOptOutEndorsementPending,
					ParticipantReasonCode.CollectingData,
					ParticipantReasonCode.DeviceReplacementNeeded
				], expected: true
			}
		])
			("should display participant change enrollment: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();

				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: data.experience ?? DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				component.participant.snapshotDetails.reasonCode = ParticipantReasonCode.ParticipantOptedOut;
				userInfoService.data.hasResetEnrollmentAccess = data.resetEnrollment ?? true;

				if (data.participantReasonCodes) {
					data.participantReasonCodes.forEach(x => {
						component.participant.snapshotDetails.reasonCode = x;
						const shouldDisplay = component.shouldDisplayParticipantChangeEnrollmentDate();
						expect(shouldDisplay).toEqual(data.expected);
					});
				}
				else {
					const shouldDisplay = component.shouldDisplayParticipantChangeEnrollmentDate();
					expect(shouldDisplay).toEqual(data.expected);
				}

			});
	});

	describe("describe for participant change enrollment dialog", () => {
		test.each([
			{ program: ProgramType.PriceModel2 },
			{ program: ProgramType.PriceModel2, shouldRecalculate: false },
			{ program: ProgramType.PriceModel3 },
			{ program: ProgramType.PriceModel4 }
		])
			("should process change enrollment appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, label, dialogService, participantService } = setup().default();
				const component = build();
				const enrollmentDate = new Date(2021, 1, 1);
				const shouldRecalculate = data.shouldRecalculate ?? true;
				const endorsementDate = new Date(2021, 3, 3);
				testSetup({ component, helper, query, resourceQuery, participantExperience: DeviceExperience.Mobile });
				component.participant.snapshotDetails.programType = data.program;
				const subtitle = label.getDialogSubtitleForParticipant(component.participant);
				dialogService.confirmed.mockReturnValue(of({ enrollmentDate, shouldRecalculate, endorsementDate }));
				participantService.updateEnrollmentDate20.mockReturnValueOnce(of({}));
				participantService.updateEnrollmentDate.mockReturnValueOnce(of({}));

				component.openParticipantChangeEnrollmentDateDialog();

				expect(dialogService.openFormDialog).toHaveBeenCalledWith({
					title: "Change Enrollment Date",
					subtitle,
					component: data.program === ProgramType.PriceModel2 ? EnrollmentDate20Component : EnrollmentDateComponent,
					formModel: { enrollmentDate: undefined, shouldRecalculate: undefined, endorsementDate: undefined },
					componentData: { participant: component.participant },
					helpKey: HelpText.EnrollmentDateChange
				});

				if (data.program === ProgramType.PriceModel2) {
					expect(participantService.updateEnrollmentDate20).toHaveBeenCalledWith(component["policy"].policyNumber, component.participant, enrollmentDate, endorsementDate, shouldRecalculate);
				}
				else {
					expect(participantService.updateEnrollmentDate).toHaveBeenCalledWith(component["policy"].policyNumber, component.participant, enrollmentDate);
				}
			});
	});

	describe("describe for mobile change number display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ expected: false },
			{ registration: { mobileRegistrationCode: "123" }, expected: true }
		])
			("should display mobile change number appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.registrationDetails = data.registration as Registration ?? undefined;

				const shouldDisplay = component.shouldDisplayMobileChangeNumber();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for participant compatibility display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ expected: true }
		])
			("should display participant compatibility appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				const shouldDisplay = component.shouldDisplayCompatibility();

				expect(shouldDisplay).toEqual(data.expected);
			});

		it("should open add compatibility issue modal", () => {
			const { build, resourceQuery, helper, dialogService, query } = setup().default();
			const component = build();
			testSetup({
				component,
				helper,
				query,
				resourceQuery,
				participantExperience: DeviceExperience.Mobile,
				isMaxPolicyPeriod: true
			});

			query.policy$.pipe(take(1)).subscribe(x => {
				component.participant = x.participants[0];
			});
			dialogService.confirmed.mockReturnValue(of({} as CompatibilityItem));

			component.openCompatibilityDialog();

			expect(dialogService.openFormDialog).toHaveBeenCalled();
		});
	});

	describe("describe for mobile swap driver display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ programType: ProgramType.PriceModel4, expected: false },
			{ mobileRegCompleteCount: 1, expected: true },
			{ participantCount: 1, expected: false },
			{ statusSummary: MobileRegistrationStatusSummary.Disabled, expected: false },
			{ expected: true }
		])
			("should display mobile swap driver appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true,
					participantProgram: data.programType ?? ProgramType.PriceModel3,
					participantCount: data.participantCount ?? 2,
					mobileRegistrationCompleteCount: data.mobileRegCompleteCount ?? 1
				});
				component.participant.registrationDetails.statusSummary = data.statusSummary
					?? component.participant.registrationDetails.statusSummary
					?? MobileRegistrationStatusSummary.Complete;
				const shouldDisplay = component.shouldDisplaySwapDriver();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for open mobile swap driver display", () => {
		test.each([
			{ title: "Swap Drivers", subtitle: "Participant name", confirm: true }
		])
			("should open modal for swapping driver", (data) => {
				const { build, helper, query, resourceQuery, label, dialogService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile
				});

				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);
				dialogService.confirmed.mockReturnValue(of(data.confirm));

				component.openSwapDriverDialog();

				expect(dialogService.openFormDialog).toHaveBeenCalledWith({
					title: data.title,
					subtitle: data.subtitle,
					component: SwapDriverComponent,
					formModel: { destParticipant: undefined },
					componentData: component.participant,
					width: CUI_DIALOG_WIDTH.MEDIUM,
					helpKey: HelpText.SwapDrivers
				});
			});
	});

	describe("describe for mobile unlock display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: true, statusSummary: MobileRegistrationStatusSummary.Locked, result: true },
			{ isMaxAndNotTheftOnly: false, statusSummary: MobileRegistrationStatusSummary.Locked, result: false },
			{ isMaxAndNotTheftOnly: true, statusSummary: MobileRegistrationStatusSummary.Complete, result: false },
			{ isMaxAndNotTheftOnly: false, statusSummary: MobileRegistrationStatusSummary.Complete, result: false },
		])
			("should display mobile unlock appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();

				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Mobile,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.registrationDetails.statusSummary = data.statusSummary;
				const shouldDisplay = component.shouldDisplayMobileUnlockRegistration();

				expect(shouldDisplay).toEqual(data.result);
			});
	});

	describe("describe for mobile switch to obd display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ experience: DeviceExperience.Device, expected: false },
			{ program: ProgramType.PriceModel4, expected: false },
			{ participantStatus: ParticipantStatus.Active, participantReason: ParticipantReasonCode.MobilePendingRegistration, expected: false },
			{ participantStatus: ParticipantStatus.Pending, participantReason: ParticipantReasonCode.CollectingData, expected: false },
			{ participantStatus: ParticipantStatus.Pending, participantReason: ParticipantReasonCode.MobilePendingRegistration, expected: true },
			{ participantStatus: ParticipantStatus.Active, participantReason: ParticipantReasonCode.CollectingData, expected: true }
		])
			("should display mobile switch to obd appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantStatus: data.participantStatus,
					participantReason: data.participantReason,
					participantExperience: data.experience ?? DeviceExperience.Mobile,
					participantProgram: data.program,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly
				});

				const shouldDisplay = component.shouldDisplaySwitchMobileToOBD();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device defective display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ isOps: false, expected: false },
			{ serialNumber: "", receiveDate: new Date(), abandonDate: new Date(), expected: false },
			{ wireless: "test defective", expected: false },
			{ wireless: "test rma", expected: false },
			{ receiveDate: new Date(), expected: false },
			{ abandonDate: new Date(), expected: false },
			{ expected: true }
		])
			("should display device defective appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				userInfoService.data.isInOpsAdminRole = data.isOps ?? true;
				component.participant.pluginDeviceDetails = {
					deviceSerialNumber: data.serialNumber === "" ? undefined : component.participant.pluginDeviceDetails.deviceSerialNumber,
					wirelessStatus: data.wireless ?? component.participant.pluginDeviceDetails.wirelessStatus,
					deviceReceivedDate: data.receiveDate,
					deviceAbandonedDate: data.abandonDate
				} as PluginDevice;

				const shouldDisplay = component.shouldDisplayDeviceDefective();
				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device abandon display", () => {
		test.each([
			{ experience: DeviceExperience.Mobile, expected: false },
			{ serialNumber: "", expected: false },
			{ receiveDate: new Date(), expected: false },
			{ abandonDate: new Date(), expected: false },
			{
				participant: [
					{ status: ParticipantStatus.Active, reason: ParticipantReasonCode.DeviceReplacementNeeded },
					{ status: ParticipantStatus.Inactive, reason: ParticipantReasonCode.ParticipantOptedOut },
					{ status: ParticipantStatus.Unenrolled, reason: ParticipantReasonCode.ParticipantOptedOut }
				], expected: true
			},
			{ expected: false }
		])
			("should display device abandon appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: data.experience ?? DeviceExperience.Device
				});

				if (component.participant.snapshotDetails.enrollmentExperience === DeviceExperience.Device) {
					component.participant.pluginDeviceDetails = {
						...component.participant.pluginDeviceDetails,
						...{
							serialNumber: data.serialNumber === "" ? undefined : component.participant.pluginDeviceDetails.deviceSerialNumber,
							receiveDate: data.receiveDate ?? component.participant.pluginDeviceDetails.deviceReceivedDate,
							abandonDate: data.abandonDate ?? component.participant.pluginDeviceDetails.deviceAbandonedDate
						}
					};
				}

				if (data.participant) {
					data.participant.forEach(x => {
						component.participant.snapshotDetails.status = x.status;
						component.participant.snapshotDetails.reasonCode = x.reason;

						const shouldDisplay = component.shouldDisplayDeviceAbandon();
						expect(shouldDisplay).toEqual(data.expected);
					});
				}
				else {
					component.participant.snapshotDetails.status = ParticipantStatus.Pending;

					const shouldDisplay = component.shouldDisplayDeviceAbandon();
					expect(shouldDisplay).toEqual(data.expected);
				}

			});
	});

	describe("describe for device activate display", () => {
		test.each([
			{ experience: DeviceExperience.Mobile, expected: false },
			{ participantStatus: ParticipantStatus.Inactive, expected: false },
			{ receiveDate: new Date(), expected: false },
			{ serialNumber: "", expected: false },
			{
				participantReason: [
					ParticipantReasonCode.CollectingData
				], expected: true
			},
			{ expected: false }
		])
			("should display device activate appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: data.experience ?? DeviceExperience.Device
				});

				component.participant.snapshotDetails.status = data.participantStatus ?? ParticipantStatus.Active;
				if (component.participant.snapshotDetails.enrollmentExperience === DeviceExperience.Device) {
					component.participant.pluginDeviceDetails.deviceReceivedDate = data.receiveDate ?? undefined;
					component.participant.pluginDeviceDetails.deviceSerialNumber = data.serialNumber === "" ? undefined : component.participant.pluginDeviceDetails.deviceSerialNumber;
				}

				if (data.participantReason) {
					data.participantReason.forEach(x => {
						component.participant.snapshotDetails.reasonCode = x;

						const shouldDisplay = component.shouldDisplayActivateDevice();
						expect(shouldDisplay).toEqual(data.expected);
					});
				}
				else {
					component.participant.snapshotDetails.reasonCode = ParticipantReasonCode.AutomatedOptInEndorsementPending;
					const shouldDisplay = component.shouldDisplayActivateDevice();
					expect(shouldDisplay).toEqual(data.expected);
				}

			});
	});

	describe("describe for device audio display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ abandonDate: new Date(), expected: false },
			{ receiveDate: new Date(), expected: false },
			{ features: [DeviceFeature.Audio], expected: true },
			{ expected: false }
		])
			("should display device audio appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.pluginDeviceDetails.features = data.features ?? [];

				const shouldDisplay = component.shouldDisplayAudioToggle();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device AWS audio display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ abandonDate: new Date(), expected: false },
			{ receiveDate: new Date(), expected: false },
			{ features: [DeviceFeature.Audio, DeviceFeature.AWSIot], expected: true },
			{ expected: false }
		])
			("should display device AWS audio appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true

				});
				component.participant.pluginDeviceDetails.features = data.features ?? [];

				const shouldDisplay = component.shouldDisplayAudioAWSToggle();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for openDeviceAudioAWSDialog", () => {
		test.each([
			{
				subtitle: "Participant name", confirmed: "On", currentAudioStatus: "On", notificiationMessage: "Audio Change Successful"
			}
		])
			("should display mobile unlock registration dialog appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, dialogService, deviceService, notificationService, label } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device
				});
				dialogService.confirmed.mockReturnValue(of(data.confirmed));
				deviceService.getAudioStatus.mockReturnValue(of(data.currentAudioStatus));
				deviceService.setAudioStatus.mockReturnValue(of({}));
				label.getDialogSubtitleForParticipant.mockReturnValue(data.subtitle);

				component.openDeviceAudioAWSDialog();

				expect(dialogService.openConfirmationDialog).toHaveBeenCalledTimes(2);
				expect(deviceService.getAudioStatus).toHaveBeenCalled();
				expect(notificationService.success).toHaveBeenCalledWith(data.notificiationMessage);
			});
	});

	describe("describe for device ping display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ wirless: "<6", expected: false },
			{ wirless: "TestLengthMoreThan6", expected: false },
			{ expected: true }
		])
			("should display device ping appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.pluginDeviceDetails.wirelessStatus = data.wirless ?? component.participant.pluginDeviceDetails.wirelessStatus;

				const shouldDisplay = component.shouldDisplayPing();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device connection timeline display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ serialNumber: "", expected: false },
			{ expected: true }
		])
			("should display device connection timeline appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.pluginDeviceDetails.deviceSerialNumber = data.serialNumber === "" ? undefined : component.participant.pluginDeviceDetails.wirelessStatus;

				const shouldDisplay = component.shouldDisplayConnectionTimeline();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device location display", () => {
		test.each([
			{ isTheft: false, isTheftOnly: false, expected: false },
			{ isTheft: false, isTheftOnly: true, expected: true },
			{ isTheft: true, isTheftOnly: false, expected: true }
		])
			("should display device location appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device
				});
				userInfoService.data.isInTheftRole = data.isTheft;
				userInfoService.data.isInTheftOnlyRole = data.isTheftOnly;

				const shouldDisplay = component.shouldDisplayDeviceLocation();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device recovery display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ expected: true }
		])
			("should display device recovery appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				const shouldDisplay = component.shouldDisplayDeviceRecovery();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device initial discount display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ isOps: false, expected: false },
			{ expected: true }
		])
			("should display device initial discount appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper, userInfoService } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				userInfoService.data.isInOpsAdminRole = data.isOps ?? true;

				const shouldDisplay = component.shouldDisplayInitialDiscount();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device swap display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ participantCount: 1, expected: false },
			{ wireless: "<6", expected: false },
			{ wireless: "WirelessStatusMoreThan6", isRecycled: true, expected: false },
			{ wireless: "WirelessStatusMoreThan6", isRecycled: false, expected: true },
			{ isRecycled: true, expected: false },
			{ expected: true }
		])
			("should display device swap appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					participantCount: data.participantCount ?? 2,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.snapshotDetails.status = ParticipantStatus.Active;
				component.participant.pluginDeviceDetails.deviceSerialNumber = "123" + (data.isRecycled ? "recycled" : "");
				component.participant.pluginDeviceDetails.wirelessStatus = data.wireless ?? "Active-InVehicle";

				const shouldDisplay = component.shouldDisplaySwapDevice();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device track shipment display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ expected: true }
		])
			("should display device track shipment appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});

				const shouldDisplay = component.shouldDisplayTrackShipment();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for device replace display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ participantStatus: ParticipantStatus.Inactive, expected: false },
			{
				reasonCode: [
					ParticipantReasonCode.DeviceReplacementNeeded
				], expected: false
			},
			{ expected: true }
		])
			("should display device replace appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.snapshotDetails.status = data.participantStatus ?? ParticipantStatus.Active;
				const reasonCodes = data.reasonCode ?? [ParticipantReasonCode.AutomatedOptInEndorsementPending];

				reasonCodes.forEach(x => {
					component.participant.snapshotDetails.reasonCode = x;
					const shouldDisplay = component.shouldDisplayDeviceReplace();
					expect(shouldDisplay).toEqual(data.expected);
				});

			});
	});

	describe("describe for open device cancel replace dialog", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ participantStatus: ParticipantStatus.Inactive, expected: false },
			{
				reasonCode: [
					ParticipantReasonCode.DeviceReplacementNeeded
				], expected: true
			},
			{ expected: false }
		])
			("should display device cancel replace dialog appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.snapshotDetails.status = data.participantStatus ?? ParticipantStatus.Active;
				const reasonCodes = data.reasonCode ?? [ParticipantReasonCode.AutomatedOptInEndorsementPending];

				reasonCodes.forEach(x => {
					component.participant.snapshotDetails.reasonCode = x;
					const shouldDisplay = component.shouldDisplayCancelReplace();
					expect(shouldDisplay).toEqual(data.expected);
				});
			});
	});

	describe("describe for device reset display", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ wireless: "<6", expected: false },
			{ wireless: "WirelessStatusMoreThan6", expected: false },
			{ expected: true }
		])
			("should display device reset appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: DeviceExperience.Device,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.pluginDeviceDetails = { wirelessStatus: data.wireless ?? "Active-InVehicle" } as PluginDevice;

				const shouldDisplay = component.shouldDisplayDeviceReset();
				expect(shouldDisplay).toEqual(data.expected);

			});
	});

	describe("describe for mobile re-enroll", () => {
		test.each([
			{ isMaxAndNotTheftOnly: false, expected: false },
			{ experience: DeviceExperience.Mobile, expected: false },
			{ experience: DeviceExperience.OEM, expected: false },
			{ program: ProgramType.PriceModel4, expected: false },
			{ status: ParticipantStatus.Active, expected: false },
			{ reason: ParticipantReasonCode.CollectingData, expected: false },
			{ hasMobileReg: false, expected: false },
			{ expected: true }
		])
			("should display mobile re-enroll appropriately when: %s", (data) => {
				const { build, resourceQuery, query, helper } = setup().default();
				const component = build();
				query.policyRegistrations$ = of([{ participantExternalId: data.hasMobileReg === false ? "456" : "123" } as Registration]);
				testSetup({
					component,
					helper,
					query,
					resourceQuery,
					participantExperience: data.experience ?? DeviceExperience.Device,
					participantProgram: data.program ?? ProgramType.PriceModel3,
					isMaxPolicyPeriod: data.isMaxAndNotTheftOnly ?? true
				});
				component.participant.telematicsId = "123";
				component.participant.snapshotDetails.status = data.status ?? ParticipantStatus.Inactive;
				component.participant.snapshotDetails.reasonCode = data.reason ?? ParticipantReasonCode.ParticipantOptedOut;

				if (data.expected) {
					component.participant.pluginDeviceDetails = undefined;
				}

				const shouldDisplay = component.shouldDisplayReEnroll();
				expect(shouldDisplay).toEqual(data.expected);

			});
	});
});
