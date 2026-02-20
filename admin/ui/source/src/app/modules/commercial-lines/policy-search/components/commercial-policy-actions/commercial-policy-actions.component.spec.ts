import { DialogService, UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { Registration, UserInfo } from "@modules/shared/data/resources";
import { of } from "rxjs";
import { RegistrationService } from "@modules/customer-service/shared/services/registration.service";
import { MatDialog } from "@angular/material/dialog";
import { CommercialPolicyQuery } from "../../stores/_index";
import { CommercialPolicyService } from "../../services/comm-policy.service";
import { CLPolicyActionsComponent } from "./commercial-policy-actions.component";

function setup() {

	const query = autoSpy(CommercialPolicyQuery);
	query.policyRegistrations$ = of([
		{ participantExternalId: "1" },
		{ participantExternalId: "2" }
	] as Registration[]);
	Object.defineProperty(query, "activePolicyNumber", { value: "123" });
	const dialog = autoSpy(MatDialog);
	const dialogService = autoSpy(DialogService);
	const registrationService = autoSpy(RegistrationService);
	const userInfoService = autoSpy(UserInfoService);
	(userInfoService as any).userInfo = {} as UserInfo;
	const policyService = autoSpy(CommercialPolicyService);
	const builder = {
		query,
		dialog,
		dialogService,
		userInfoService,
		registrationService,
		policyService,
		default() {
			return builder;
		},
		build() {
			return new CLPolicyActionsComponent(query as CommercialPolicyQuery, dialog, dialogService, userInfoService, registrationService, policyService);
		}
	};

	return builder;
}

describe("CLPolicyActionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for shouldDisplayMobileRegistration", () => {
		test.each([
			{ isInOpsAdminRole: false, isInOpsUserRole: false, hasRegistrations: true, expected: false },
			{ isInOpsAdminRole: true, isInOpsUserRole: false, hasRegistrations: false, expected: false },
			{ isInOpsAdminRole: false, isInOpsUserRole: true, hasRegistrations: false, expected: false },
			{ isInOpsAdminRole: true, isInOpsUserRole: false, hasRegistrations: true, expected: true },
			{ isInOpsAdminRole: false, isInOpsUserRole: true, hasRegistrations: true, expected: true },
			{ isInOpsAdminRole: true, isInOpsUserRole: true, hasRegistrations: true, expected: true }
		]);
	});
});
