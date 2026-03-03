import { Component, OnInit } from "@angular/core";
import { PolicyTransferDialogService } from "@modules/customer-service/snapshot/services/dialog-services/policy-transfer-dialog/policy-transfer-dialog.service";
import { ParticipantService, SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { Address, Registration, Participant, Policy } from "@modules/shared/data/resources";
import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";
import { UserInfoService } from "@modules/shared/services/user-info/user-info.service";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CUI_DIALOG_WIDTH, NotificationService } from "@pgr-cla/core-ui-components";
import { forkJoin } from "rxjs";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { TelematicsFeaturesMenuData } from "@modules/customer-service/shared/data/models";
import { CrossAppService } from "@modules/customer-service/shared/services/cross-app.service";
import { CrossAppQuery } from "@modules/customer-service/shared/stores/cross-app-query";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { MobileRegistrationComponent } from "@modules/customer-service/shared/components/_index";
import { RegistrationService } from "@modules/customer-service/shared/services/registration.service";
import { tap } from "rxjs/operators";
import { PolicyDetailsEditComponent } from "../policy-details-edit/policy-details-edit.component";
import { ParticipantMergeComponent } from "../../participant/actions/common/participant-merge/participant-merge.component";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-policy-actions",
    templateUrl: "./policy-actions.component.html",
    styleUrls: ["./policy-actions.component.scss"],
    standalone: false
})
export class PolicyActionsComponent implements OnInit {

	public policy: Policy;
	public features = TelematicsFeatures;
	public availableFeatures: TelematicsFeaturesMenuData[] = [];

	private isInAppChangeRole: boolean;
	private isMaxPolicyPeriod: boolean;
	private mobileRegistrations: Registration[];

	constructor(
		private helper: ResourceQuery,
		private dialogService: DialogService,
		private notificationService: NotificationService,
		public query: SnapshotPolicyQuery,
		private userInfoService: UserInfoService,
		private participantService: ParticipantService,
		private snapshotPolicyService: SnapshotPolicyService,
		private policyTransferDialogService: PolicyTransferDialogService,
		private registrationService: RegistrationService,
		private crossAppQuery: CrossAppQuery,
		private crossAppService: CrossAppService
	) { }

	ngOnInit(): void {
		this.query.policyRegistrations$.pipe(untilDestroyed(this)).subscribe(x => this.mobileRegistrations = x);
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			this.policy = x;
			this.isMaxPolicyPeriod = this.helper.getExtender(this.policy, "IsMaxPolicyPeriod") === true;
		});
		this.crossAppQuery.policyEnrolledFeatures$.pipe(untilDestroyed(this)).subscribe(x =>
			this.availableFeatures = this.crossAppService.getAvailableFeaturesMenuData(TelematicsFeatures.Snapshot, x));
		this.isInAppChangeRole = this.userInfoService.data.isInAppChangeRole;
	}

	feeReversalOnly(): boolean {
		return this.userInfoService.data.isInFeeReversalOnlyRole;
	}

	shouldDisplayEditPolicy(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	openEditPolicyDialog(): void {
		const title = "Edit Policy Details";
		this.dialogService.openFormDialog({
			title,
			component: PolicyDetailsEditComponent,
			helpKey: HelpText.PolicyDetails,
			componentData: {
				groupExternalId: this.policy.snapshotDetails.groupExternalId,
				appExpirationDate: this.policy.snapshotDetails.appInfo.assignmentExpirationDateTime
			},
			formModel: { mailingAddress: this.policy.snapshotDetails.mailingAddress, appName: this.policy.snapshotDetails.appInfo.appName }
		});

		this.dialogService.confirmed<{ mailingAddress: Address; appName: string }>().subscribe(x => {
			const shouldUpdateAppAssignment = x.appName && this.isInAppChangeRole && x.appName !== this.policy.snapshotDetails.appInfo.appName;
			const apiCalls = [this.snapshotPolicyService.updateMailingAddress(this.policy.policyNumber, x.mailingAddress)];

			if (shouldUpdateAppAssignment) {
				apiCalls.push(this.snapshotPolicyService.updateAppAssignment(this.policy.policyNumber, x.appName));
			}

			forkJoin(apiCalls).subscribe(_ => {
				this.notificationService.success(`${title} Successful`);
			});
		});
	}

	shouldDisplayPolicyTransfer(): boolean {
		return this.policyTransferDialogService.shouldDisplayPolicyTransfer(this.policy);
	}

	openPolicyTransferDialog(): void {
		this.policyTransferDialogService.openPolicyTransferDialog(this.policy);
	}

	shouldDisplayMobileRegistration(): boolean {
		return !this.userInfoService.data.isInTheftOnlyRole && this.mobileRegistrations?.length > 0;
	}

	openMobileRegistrationDialog(): void {
		this.dialogService.openInformationDialog({
			title: "Mobile Registration",
			component: MobileRegistrationComponent,
			componentData: {
				policyQuery: this.query,
				policyRefresh$: this.snapshotPolicyService.getPolicy(this.policy.policyNumber),
				registrationRefresh$: this.registrationService.getRegistrationByPolicy(this.policy.policyNumber)
					.pipe(tap(x => this.query.updatePolicyRegistrations(x)))
			},
			width: CUI_DIALOG_WIDTH.FULL
		});
	}

	shouldDisplayParticipantMerge(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() && this.userInfoService.data.hasVehicleSupportAccess && this.policy.participants?.length > 1;
	}

	openParticipantMergeDialog(): void {
		const title = "Merge Participants";
		this.dialogService.openFormDialog({
			title,
			component: ParticipantMergeComponent,
			formModel: { srcParticipant: undefined, destParticipant: undefined },
			manualSubmission: true,
			width: CUI_DIALOG_WIDTH.MEDIUM
		});

		this.dialogService.confirmed<{ srcParticipant: Participant; destParticipant: Participant }>().subscribe(x => {
			this.participantService.mergeParticipants(
				this.policy.policyNumber,
				this.policy.policyPeriodDetails[this.policy.policyPeriodDetails.length - 1].policySuffix,
				x.srcParticipant.snapshotDetails.participantId,
				x.destParticipant.snapshotDetails.participantId).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
		});
	}

	private isMaxPeriodAndNotTheftOnly(): boolean {
		return this.isMaxPolicyPeriod &&
			!this.userInfoService.data.isInTheftOnlyRole;
	}
}
