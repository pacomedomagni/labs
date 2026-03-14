import { MobileRegistrationStatusSummary, ParticipantReasonCode } from "@modules/shared/data/enums";
import { Participant, Policy, Registration } from "@modules/shared/data/resources";
import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { HelpText } from "../../help/metadata";
import { RegistrationDialogService } from "../../services/registration-dialog.service";
import { RegistrationService } from "../../services/registration.service";
import { PolicyQuery } from "../../stores/_index";
import { MobileRegistrationComponent } from "./mobile-registration.component";

function setup() {
	const injectedData = {
		policyQuery: {} as PolicyQuery,
		policyRefresh$: of({} as Policy),
		registrationRefresh$: of([] as Registration[])
	};
	const enumService = autoSpy(EnumService);
	const registrationService = autoSpy(RegistrationService);
	const registrationDialogService = autoSpy(RegistrationDialogService);
	const notificationService = autoSpy(NotificationService);
	const dialogService = autoSpy(DialogService);
	const labelService = autoSpy(LabelService);
	const resourceHelper = autoSpy(ResourceQuery);
	const builder = {
		injectedData,
		enumService,
		registrationService,
		registrationDialogService,
		dialogService,
		notificationService,
		labelService,
		resourceHelper,
		default() {
			return builder;
		},
		build() {
			return new MobileRegistrationComponent(injectedData,
				enumService,
				registrationService,
				registrationDialogService,
				dialogService,
				notificationService,
				labelService,
				resourceHelper);
		}
	};

	return builder;
}

describe("MobileRegistrationComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe challenge expired code", () => {
		test.each([
			{ isExpired: true },
			{ isExpired: false }
		])
			("should determine challenge expired appropriately when: %s", (data) => {
				const { build, resourceHelper } = setup().default();
				const component = build();

				resourceHelper.getExtender.mockReturnValue(data.isExpired);
				let result = component.isChallengeExpired(undefined);

				expect(result).toEqual(data.isExpired);
			});
	});

	describe("describe registration pending", () => {
		test.each([
			{ statusSummary: MobileRegistrationStatusSummary.PendingResolution, expected: true },
			{ statusSummary: MobileRegistrationStatusSummary.Complete, expected: false },
			{ statusSummary: MobileRegistrationStatusSummary.Disabled, expected: false },
			{ statusSummary: MobileRegistrationStatusSummary.Inactive, expected: false },
			{ statusSummary: MobileRegistrationStatusSummary.Locked, expected: false },
			{ statusSummary: MobileRegistrationStatusSummary.New, expected: false },
		])
			("should determine if registration is pending appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				let registration = { statusSummary: data.statusSummary } as Registration;
				let result = component.isRegistrationPending(registration);

				expect(result).toEqual(data.expected);
			});
	});

	describe("describe unlock", () => {
		test.each([
			{ statusSummary: MobileRegistrationStatusSummary.Locked, expected: false },
			{ statusSummary: MobileRegistrationStatusSummary.Complete, expected: true },
		])
			("should determine when to disable unlock appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				component.selectedRegistration = { statusSummary: data.statusSummary } as Registration;
				let result = component.shouldDisableUnlock();

				expect(result).toEqual(data.expected);
			});
	});

	describe("describe reset", () => {
		test.each([
			{ registration: undefined, forceNull: true, expected: true },
			{ registration: { challengeRequestCount: 10 }, expected: true },
			{ registration: { challengeRequestCount: 9 }, expected: false },
			{ participant: { snapshotDetails: { reasonCode: ParticipantReasonCode.PolicyCanceled } }, expected: true },
			{ expected: false }
		])
			("should determine when to disable reset appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				component.selectedRegistration = (data.registration ?? { challengeRequestCount: 0 })  as Registration;

				if (data.forceNull) {
					component.selectedRegistration = undefined;
				}

				component.selectedParticipant = (data.participant ?? { snapshotDetails: { reasonCode: ParticipantReasonCode.AutomatedOptInEndorsementPending } }) as Participant;
				let result = component.shouldDisableReset();

				expect(result).toEqual(data.expected);
			});
	});

	describe("describe inactivate", () => {
		test.each([
			{ registration: undefined, forceNull: true, expected: true },
			{ registration: { statusSummary: MobileRegistrationStatusSummary.Inactive }, expected: true },
			{ expected: false }
		])
			("should determine when to disable inactivate appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				component.selectedRegistration = (data.registration ?? { statusSummary: MobileRegistrationStatusSummary.Complete }) as Registration;

				if (data.forceNull) {
					component.selectedRegistration = undefined;
				}

				let result = component.shouldDisableInactivate();

				expect(result).toEqual(data.expected);
			});
	});

	describe("describe change phone", () => {
		test.each([
			{ registration: undefined, forceNull: true, expected: true },
			{ expected: false }
		])
			("should determine when to disable change phone appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				component.selectedRegistration = (data.registration ?? { statusSummary: MobileRegistrationStatusSummary.Complete }) as Registration;

				if (data.forceNull) {
					component.selectedRegistration = undefined;
				}

				let result = component.shouldDisableChangePhone();

				expect(result).toEqual(data.expected);
			});
	});

	it("should open unlock with correct parameters", () => {
		const { build, injectedData, registrationDialogService } = setup().default();
		const component = build();

		component.data = injectedData;
		component.selectedParticipant = { telematicsId: "123" } as Participant;
		component.selectedRegistration = { statusSummary: MobileRegistrationStatusSummary.Locked } as Registration;

		component.openUnlock();

		expect(registrationDialogService.openUnlockDialog).toHaveBeenCalledWith(component.selectedParticipant, component.selectedRegistration, injectedData.policyRefresh$);
	});

	it("should open change phone with correct parameters", () => {
		const { build, injectedData, registrationDialogService } = setup().default();
		const component = build();

		Object.defineProperty(injectedData.policyQuery, "activePolicyNumber", { value: "policyNumber" });

		component.data = injectedData;
		component.selectedParticipant = { telematicsId: "123" } as Participant;
		component.selectedRegistration = { statusSummary: MobileRegistrationStatusSummary.Locked } as Registration;

		component.openChangePhone();

		expect(registrationDialogService.openRegistrationUpdateDialog).toHaveBeenCalledWith("policyNumber", component.selectedParticipant, component.selectedRegistration, injectedData.policyRefresh$);
	});

	it("should open reset with correct parameters", () => {
		const { build, injectedData, dialogService } = setup().default();
		const component = build();

		Object.defineProperty(injectedData.policyQuery, "activePolicyNumber", { value: "policyNumber" });

		dialogService.confirmed.mockReturnValue(of(true));
		component.data = injectedData;
		component.selectedRegistration = { driverFirstName: "firstName", driverLastName: "lastName" } as Registration;

		component.openReset();

		expect(dialogService.openConfirmationDialog).toHaveBeenCalledWith({
			title: `Reset Mobile Registration`,
			subtitle: "firstName lastName",
			message: `Are you sure you want to reset this registration?`,
			helpKey: HelpText.MobileRegistrationReset,
			confirmText: "YES"
		});
	});

	it("should open inactivate with correct parameters", () => {
		const { build, injectedData, dialogService } = setup().default();
		const component = build();

		Object.defineProperty(injectedData.policyQuery, "activePolicyNumber", { value: "policyNumber" });

		dialogService.confirmed.mockReturnValue(of(true));
		component.data = injectedData;
		component.selectedRegistration = { driverFirstName: "firstName", driverLastName: "lastName" } as Registration;

		component.openInactivate();

		expect(dialogService.openConfirmationDialog).toHaveBeenCalledWith({
			title: `Inactivate Mobile Registration`,
			subtitle: "firstName lastName",
			message: `Are you sure you want to inactivate this registration?`,
			helpKey: HelpText.MobileRegistrationInactivate,
			confirmText: "YES"
		});
	});

});
