
import { PolicyActionsComponent } from "@modules/customer-service/are/components/_index";
import { DialogService, UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { PolicyEnrolledFeatures, Registration, UserInfo } from "@modules/shared/data/resources";
import { of } from "rxjs";
import { MobileRegistrationComponent } from "@modules/customer-service/shared/components/_index";
import { CrossAppService } from "@modules/customer-service/shared/services/cross-app.service";
import { CrossAppQuery } from "@modules/customer-service/shared/stores/cross-app-query";
import { RegistrationService } from "@modules/customer-service/shared/services/registration.service";
import { PolicyQuery } from "@modules/customer-service/shared/stores/_index";
import { ArePolicyQuery } from "../../stores/_index";
import { ArePolicyService } from "../../services/are-policy.service";

function setup() {

	const query = autoSpy(PolicyQuery);
	query.policyRegistrations$ = of([
		{ participantExternalId: "1" },
		{ participantExternalId: "2" }
	] as Registration[]);
	Object.defineProperty(query, "activePolicyNumber", { value: "123" });

	const crossAppQuery = autoSpy(CrossAppQuery);
	crossAppQuery.policyEnrolledFeatures$ = of({} as PolicyEnrolledFeatures);
	const crossAppService = autoSpy(CrossAppService);
	const dialogService = autoSpy(DialogService);
	const registrationService = autoSpy(RegistrationService);
	const userInfoService = autoSpy(UserInfoService);
	(userInfoService as any).userInfo = {} as UserInfo;
	const policyService = autoSpy(ArePolicyService);
	const builder = {
		query,
		dialogService,
		userInfoService,
		crossAppQuery,
		crossAppService,
		registrationService,
		policyService,
		default() {
			return builder;
		},
		build() {
			return new PolicyActionsComponent(query as ArePolicyQuery, crossAppQuery, crossAppService, dialogService, userInfoService, registrationService, policyService);
		}
	};

	return builder;
}

describe("PolicyActionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should open mobile registration dialog", () => {
		const { query, registrationService, dialogService, build } = setup().default();
		query.updatePolicyRegistrations.mockReturnValue(undefined);
		registrationService.getRegistrations.mockReturnValue(of([
			{ participantExternalId: "1" },
			{ participantExternalId: "2" }
		] as Registration[]));

		const component = build();

		component["mobileRegistrations"] = [
			{ participantExternalId: "1" },
			{ participantExternalId: "2" }
		] as Registration[];

		component.openMobileRegistration();

		expect(dialogService.openInformationDialog).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Mobile Registration",
				component: MobileRegistrationComponent
			})
		);
	});

	describe("describe for shouldDisplayMobileRegistration", () => {
		test.each([
			{ isInOpsAdminRole: false, isInOpsUserRole: false, hasRegistrations: true, expected: false },
			{ isInOpsAdminRole: true, isInOpsUserRole: false, hasRegistrations: false, expected: false },
			{ isInOpsAdminRole: false, isInOpsUserRole: true, hasRegistrations: false, expected: false },
			{ isInOpsAdminRole: true, isInOpsUserRole: false, hasRegistrations: true, expected: true },
			{ isInOpsAdminRole: false, isInOpsUserRole: true, hasRegistrations: true, expected: true },
			{ isInOpsAdminRole: true, isInOpsUserRole: true, hasRegistrations: true, expected: true }
		])
			("should display mobile registration menu appropriately when: %s", (data) => {
				const { userInfoService, build } = setup().default();
				userInfoService.data.isInOpsAdminRole = data.isInOpsAdminRole;
				userInfoService.data.isInOpsUserRole = data.isInOpsUserRole;
				const component = build();
				component["mobileRegistrations"] = data.hasRegistrations ? [{} as Registration] : undefined;

				let result = component.shouldDisplayMobileRegistration();

				expect(result).toEqual(data.expected);
			});
	});
});
