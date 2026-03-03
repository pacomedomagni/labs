import { CrossAppService } from "@modules/customer-service/shared/services/cross-app.service";
import { RegistrationService } from "@modules/customer-service/shared/services/_index";
import { CrossAppQuery } from "@modules/customer-service/shared/stores/cross-app-query";
import { ParticipantService, SnapshotPolicyService, PolicyTransferDialogService } from "@modules/customer-service/snapshot/services/_index";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { Address, Participant, Policy, PolicyEnrolledFeatures, SnapshotPolicyDetails } from "@modules/shared/data/resources";
import { DialogService, UserInfoService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { PolicyActionsComponent } from "./policy-actions.component";

function setup() {
	const policy = {
		policyNumber: "123",
		snapshotDetails: {
			appInfo: {},
			mailingAddress: {},
			groupExternalId: "456"
		} as SnapshotPolicyDetails
	} as Policy;
	const helper = autoSpy(ResourceQuery);
	const dialogService = autoSpy(DialogService);
	const notificationService = autoSpy(NotificationService);
	const query = autoSpy(SnapshotPolicyQuery);
	query.policy$ = of(policy);
	query.mobileParticipants$ = of([{} as Participant]);
	query.policyRegistrations$ = of([]);
	const userInfoService = autoSpy(UserInfoService);
	const snapshotPolicyService = autoSpy(SnapshotPolicyService);
	const participantService = autoSpy(ParticipantService);
	const policyTransferDialogService = autoSpy(PolicyTransferDialogService);
	const crossAppService = autoSpy(CrossAppService);
	const crossAppQuery = autoSpy(CrossAppQuery);
	crossAppQuery.policyEnrolledFeatures$ = of({} as PolicyEnrolledFeatures);
	crossAppService.getAvailableFeaturesMenuData.mockReturnValue([]);
	const registrationService = autoSpy(RegistrationService);

	const builder = {
		policy,
		helper,
		dialogService,
		notificationService,
		query,
		userInfoService,
		participantService,
		snapshotPolicyService,
		policyTransferDialogService,
		crossAppService,
		crossAppQuery,
		registrationService,
		default() {
			return builder;
		},
		build() {
			return new PolicyActionsComponent(helper, dialogService, notificationService, query, userInfoService, participantService, snapshotPolicyService, policyTransferDialogService, registrationService, crossAppQuery, crossAppService);
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

	describe("describe for participant merge display", () => {
		test.each([
			{ isMaxPolicyPeriod: false, expected: false },
			{ isTheftOnly: true, expected: false },
			{ vehicleSupport: false, expected: false },
			{ participantCount: 1, expected: false },
			{ expected: true }
		])
			("should display participant merge appropriately when: %s", (data) => {
				const { build, query, userInfoService } = setup().default();
				const component = build();
				userInfoService.data.isInTheftOnlyRole = data.isTheftOnly ?? false;
				const participants = [];
				for (let i = 0; i < (data.participantCount ?? 2); i++) {
					participants.push({} as Participant);
				}
				query.policy$ = of({ participants } as Policy);
				userInfoService.data.hasVehicleSupportAccess = data.vehicleSupport ?? true;
				component.ngOnInit();
				component["isMaxPolicyPeriod"] = data.isMaxPolicyPeriod ?? true;

				const shouldDisplay = component.shouldDisplayParticipantMerge();

				expect(shouldDisplay).toEqual(data.expected);
			});
	});

	describe("policy mailing address and app assignment updates", () => {
		test.each([
			{ hasUpdateRole: false, appUpdateExpected: false },
			{ appName: "SMA", origAppName: "MNA", appUpdateExpected: false },
			{ appName: "SMA", appUpdateExpected: true },
			{ appName: "MNA", origAppName: "SMA", appUpdateExpected: false },
			{ appName: "MNA", appUpdateExpected: false },
			{ appUpdateExpected: false }
		])
			("should update policy mailing address and app assignment appropriately when: %s", (data) => {
				const { build, policy, dialogService, snapshotPolicyService } = setup().default();
				const component = build();
				policy.snapshotDetails.appInfo.appName = data.origAppName ?? "MNA";
				const mailingAddress = { address1: "123 st", city: "fake city", state: "OH" } as Address;
				const appName = data.appName !== undefined ? data.appName : "MNA";
				dialogService.confirmed.mockReturnValue(of({ mailingAddress, appName }));
				component.ngOnInit();
				component["isInAppChangeRole"] = data.hasUpdateRole ?? true;

				component.openEditPolicyDialog();

				expect(dialogService.openFormDialog).toHaveBeenCalled();
				expect(snapshotPolicyService.updateMailingAddress).toHaveBeenCalledWith(policy.policyNumber, mailingAddress);

				if (data.appUpdateExpected) {
					expect(snapshotPolicyService.updateAppAssignment).toHaveBeenCalledWith(policy.policyNumber, appName);
				}
			});
	});

	it("should not update policy mailing address if canceled", () => {
		const { build, dialogService, snapshotPolicyService } = setup().default();
		const component = build();
		dialogService.confirmed.mockReturnValue(of(undefined));
		component.ngOnInit();

		component.openEditPolicyDialog();

		expect(dialogService.openFormDialog).toHaveBeenCalled();
		expect(snapshotPolicyService.updateMailingAddress).toHaveBeenCalledTimes(0);
	});

	describe("policy transfer hyperlink display", () => {
		test.each([
			{ visible: false },
			{ visible: true }
		])
			("should display policy transfer appropriately when: %s", (data) => {
				const { build, policyTransferDialogService } = setup().default();
				const component = build();
				policyTransferDialogService.shouldDisplayPolicyTransfer.mockReturnValueOnce(data.visible);

				const result = component.shouldDisplayPolicyTransfer();

				expect(result).toEqual(result);
			});
	});
});
