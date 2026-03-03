import { Injectable } from "@angular/core";
import { TransferPolicySelectionComponent } from "@modules/customer-service/snapshot/components/policy/policy-transfer/transfer-policy-selection/transfer-policy-selection.component";
import { TransferPolicyComponent } from "@modules/customer-service/snapshot/components/policy/policy-transfer/transfer-policy/transfer-policy.component";
import { DeviceExperience, ParticipantReasonCode, ParticipantStatus } from "@modules/shared/data/enums";
import { Policy, PolicyPeriod } from "@modules/shared/data/resources";
import { DialogService, UserInfoService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { SnapshotPolicyService } from "../../snapshot-policy.service";

@Injectable()
export class PolicyTransferDialogService {

	constructor(
		private helper: ResourceQuery,
		private dialogService: DialogService,
		private snapshotPolicyService: SnapshotPolicyService,
		private userInfoService: UserInfoService,
		private notificationService: NotificationService) { }

	shouldDisplayPolicyTransfer(policy: Policy): boolean {
		return this.userInfoService.data.hasPolicyMergeAccess &&
			this.helper.getExtender(policy, "IsMaxPolicyPeriod") === true &&
			policy.participants.some(x => x.snapshotDetails.enrollmentExperience === DeviceExperience.Device) &&
			policy.participants.every(x => x.snapshotDetails.status === ParticipantStatus.Inactive &&
					x.snapshotDetails.reasonCode === ParticipantReasonCode.PolicyCanceled &&
					x.pluginDeviceDetails?.deviceSeqId !== undefined);
	}

	openPolicyTransferDialog(policy: Policy): void {
		const title = "Policy Transfer";
		this.dialogService.openFormDialog({
			title,
			component: TransferPolicySelectionComponent,
			formModel: { newPolicyNumber: undefined }
		});

		this.dialogService.confirmed<{ newPolicyNumber: string }>().subscribe(x => {
			if (x) {
				this.snapshotPolicyService.getPolicy(x.newPolicyNumber).subscribe(y => {

					const eligibleParticipants = policy.participants.filter(p1 => y.participants.some(p2 => p1.snapshotDetails.enrollmentExperience === DeviceExperience.Device && p2.snapshotDetails.enrollmentExperience === DeviceExperience.Device &&
							p1.snapshotDetails.vehicleDetails?.vin === p2.snapshotDetails.vehicleDetails?.vin &&
							p2.pluginDeviceDetails?.deviceSeqId === undefined));

					this.dialogService.openInformationDialog({
						title,
						component: TransferPolicyComponent,
						hideCancelButton: false,
						componentData: {
							participants: eligibleParticipants,
							oldPolicyNumber: policy.policyNumber,
							newPolicyNumber: y.policyNumber
						}
					});

					this.dialogService.confirmed().subscribe(_ => {
						if (eligibleParticipants.length > 0 && _) {

							this.dialogService.openConfirmationDialog({
								title,
								message: `Are you sure you want to transfer the data for these participants from\n
								policy #<b>${policy.policyNumber}</b> to policy #<b>${y.policyNumber}</b>?`
							});

							this.dialogService.confirmed().subscribe(confirmed => {
								if (confirmed) {
									const oldPolicy = {
										policyNumber: policy.policyNumber,
										policyPeriodDetails: [{ policyPeriodSeqId: policy.policyPeriodDetails[policy.policyPeriodDetails.length - 1].policyPeriodSeqId } as PolicyPeriod],
										participants: eligibleParticipants
									} as Policy;

									const newPolicy = {
										policyNumber: y.policyNumber,
										policyPeriodDetails: [{ policyPeriodSeqId: y.policyPeriodDetails[policy.policyPeriodDetails.length - 1].policyPeriodSeqId } as PolicyPeriod],
										participants: y.participants.filter(p => eligibleParticipants.map(e => e.snapshotDetails.vehicleDetails.vin).includes(p.snapshotDetails.vehicleDetails.vin))
									} as Policy;

									this.snapshotPolicyService.transferParticipantData(oldPolicy, newPolicy).subscribe(__ => {
										const inactivatedDevices = eligibleParticipants.filter(e => e.pluginDeviceDetails?.deviceAbandonedDate !== undefined ||
											e.pluginDeviceDetails?.deviceReceivedDate !== undefined).map(e => e.pluginDeviceDetails?.deviceSerialNumber);
										let successMessage = `${title} Successful`;
										if (inactivatedDevices.length > 0) {
											successMessage += "\n\nCannot activate devices:";
											inactivatedDevices.forEach(serialNumber => successMessage += `\n${serialNumber}`);
										}
										this.notificationService.success(successMessage);
									});
								}
							});
						}
					});
				});
			}
		});
	}
}
