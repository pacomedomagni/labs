import { MobileRegistrationStatusSummary } from "@modules/shared/data/enums";
import { Registration, UserInfo } from "@modules/shared/data/resources";
import { EnumService, UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { ArePolicyQuery } from "../../stores/_index";
import { ArePolicyService } from "../../services/_index";
import { ParticipantActionsComponent } from "./participant-actions.component";
import { AccidentDetectionDialogService, RegistrationDialogService } from "../../../shared/services/_index";

function setup() {

	const query = autoSpy(ArePolicyQuery);
	const policyService = autoSpy(ArePolicyService);
	const dialogService = autoSpy(RegistrationDialogService);
	const userInfoService = autoSpy(UserInfoService);
	const accidentDetectionDialogService = autoSpy(AccidentDetectionDialogService);
	const enumService = autoSpy(EnumService);
	(userInfoService as any).userInfo = {} as UserInfo;

	const builder = {
		query,
		policyService,
		dialogService,
		userInfoService,
		default() {
			return builder;
		},
		build() {
			return new ParticipantActionsComponent(query, policyService, dialogService, accidentDetectionDialogService, userInfoService, enumService);
		}
	};

	return builder;
}

describe("ParticipantActionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for unlock action display", () => {
		test.each([
			{ isUserRole: false, isAdminRole: false, statusSummary: MobileRegistrationStatusSummary.Complete, expected: false },
			{ isUserRole: true, isAdminRole: false, statusSummary: MobileRegistrationStatusSummary.Complete, expected: false },
			{ isUserRole: false, isAdminRole: true, statusSummary: MobileRegistrationStatusSummary.Complete, expected: false },
			{ isUserRole: true, isAdminRole: false, statusSummary: MobileRegistrationStatusSummary.Locked, expected: true },
			{ isUserRole: false, isAdminRole: true, statusSummary: MobileRegistrationStatusSummary.Locked, expected: true },
			{ isUserRole: true, isAdminRole: false, statusSummary: MobileRegistrationStatusSummary.Complete, expected: false },
			{ isUserRole: false, isAdminRole: true, statusSummary: MobileRegistrationStatusSummary.Complete, expected: false },
		])
			("should display unlock action appropriately when: %s", (data) => {
				const { build, userInfoService } = setup().default();
				userInfoService.data.isInOpsAdminRole = data.isAdminRole;
				userInfoService.data.isInOpsUserRole = data.isUserRole;
				const component = build();
				component["registration"] = { statusSummary: data.statusSummary } as Registration;

				const shouldDisplay = component.shouldDisplayUnlockRegistration();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for change phone number action display", () => {
		test.each([
			{ isUserRole: false, isAdminRole: false, expected: false },
			{ isUserRole: true, isAdminRole: false, registration: undefined, expected: false },
			{ isUserRole: true, isAdminRole: false, registration: {} as Registration, expected: true },
			{ isUserRole: false, isAdminRole: true, registration: undefined, expected: false },
			{ isUserRole: false, isAdminRole: true, registration: {} as Registration, expected: true }
		])
			("should display change phone number action appropriately when: %s", (data) => {
				const { build, userInfoService } = setup().default();
				userInfoService.data.isInOpsAdminRole = data.isAdminRole;
				userInfoService.data.isInOpsUserRole = data.isUserRole;
				const component = build();
				component["registration"] = data.registration;

				const shouldDisplay = component.shouldDisplayUpdatePhoneNumber();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("describe for unenroll participant action display", () => {
		test.each([
			{ isUserRole: false, isAdminRole: false, adEnrolled: false, expected: false },
			{ isUserRole: true, isAdminRole: false, adEnrolled: false, expected: false },
			{ isUserRole: false, isAdminRole: true, adEnrolled: false, expected: false },
			{ isUserRole: true, isAdminRole: false, adEnrolled: true, expected: true },
			{ isUserRole: false, isAdminRole: true, adEnrolled: true, expected: true }
		])
			("should display unenroll participant action appropriately when: %s", (data) => {
				const { build, userInfoService } = setup().default();
				userInfoService.data.isInOpsAdminRole = data.isAdminRole;
				userInfoService.data.isInOpsUserRole = data.isUserRole;
				const component = build();
				component.participant = { areDetails: { adEnrolled: data.adEnrolled } } as any;
				const shouldDisplay = component.shouldDisplayUnenrollParticipant();
				expect(shouldDisplay).toEqual(data.expected);
			});
	});
});
