import { DeviceExperience, ParticipantReasonCode, ParticipantStatus } from "@modules/shared/data/enums";
import { Policy, SnapshotParticipantDetails } from "@modules/shared/data/resources";
import { DialogService, UserInfoService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { SnapshotPolicyService } from "../../_index";
import { PolicyTransferDialogService } from "./policy-transfer-dialog.service";

function setup() {
	const helper = autoSpy(ResourceQuery);
	const dialogService = autoSpy(DialogService);
	const snapshotPolicyService = autoSpy(SnapshotPolicyService);
	const userInfoService = autoSpy(UserInfoService);
	const notificationService = autoSpy(NotificationService);

	const builder = {
		helper,
		dialogService,
		snapshotPolicyService,
		userInfoService,
		notificationService,
		default() {
			return builder;
		},
		build() {
			return new PolicyTransferDialogService(helper, dialogService, snapshotPolicyService, userInfoService, notificationService);
		}
	};

	return builder;
}

describe("PolicyTransferDialogService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("policy transfer hyperlink display", () => {
		test.each([
			{ hasPolicyMergeAccess: false, expected: false },
			{ isMaxPolicyPeriod: false, expected: false },
			{ allMobile: true, expected: false },
			{ status: ParticipantStatus.Active, expected: false },
			{ reason: ParticipantReasonCode.CollectingData, expected: false },
			{ hasDeviceAssigned: false, expected: false },
			{ expected: true }
		])
			("should display policy transfer appropriately when: %s", (data) => {
				const { build, helper, userInfoService } = setup().default();
				const component = build();
				userInfoService.data.hasPolicyMergeAccess = data.hasPolicyMergeAccess ?? true;
				helper.getExtender.mockReturnValue(data.isMaxPolicyPeriod ?? true);
				const policy = {
					participants: [
						{
							snapshotDetails: {
								enrollmentExperience: DeviceExperience.Mobile,
								status: ParticipantStatus.Inactive,
								reasonCode: ParticipantReasonCode.PolicyCanceled
							} as SnapshotParticipantDetails
						},
						{
							snapshotDetails: {
								enrollmentExperience: data.allMobile ? DeviceExperience.Mobile : DeviceExperience.Device,
								status: data.status ?? ParticipantStatus.Inactive,
								reasonCode: data.reason ?? ParticipantReasonCode.PolicyCanceled,
								deviceDetails: { seqId: data.hasDeviceAssigned ? 123 : undefined }
							}
						}
					]
				} as Policy;

				const result = component.shouldDisplayPolicyTransfer(policy);

				expect(result).toEqual(result);
			});
	});
});
