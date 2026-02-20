import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CUI_DIALOG_WIDTH, NotificationService } from "@pgr-cla/core-ui-components";
import { CompatibilityItem, DeviceRecoveryItem, Registration, Participant, Policy, PolicyPeriod } from "@modules/shared/data/resources";
import { DeviceExperience, DeviceFeature, MobileRegistrationStatusSummary, ParticipantReasonCode, ParticipantStatus, ProgramCode, ProgramType, StopShipmentMethod } from "@modules/shared/data/enums";
import { DeviceService, MobileService, ParticipantService, SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { DialogService, HelperService, LabelService, UserInfoService } from "@modules/shared/services/_index";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { RegistrationDialogService, RegistrationService } from "@modules/customer-service/shared/services/_index";
import { EnrollmentDateComponent } from "../actions/common/enrollment-date/enrollment-date/enrollment-date.component";
import { ExcludeDateRangeComponent } from "../actions/common/exclude-date/exclude-date-range/exclude-date-range.component";
import { OptOutSuspensionComponent } from "../actions/common/opt-out-suspension/opt-out-suspension.component";
import { RenewalScoresComponent } from "../actions/common/renewal-scores/renewal-scores.component";
import { TripSummaryComponent } from "../actions/common/trip-summary/trip-summary.component";
import { SnapshotScoreInfoComponent } from "../actions/common/snapshot-score-info/snapshot-score-info.component";
import { UpdateGuidComponent } from "../actions/common/update-guid/update-guid.component";
import { ConnectionTimelineComponent } from "../actions/plugin/connection-timeline/connection-timeline.component";
import { DeviceLocationComponent } from "../actions/plugin/device-location/device-location.component";
import { SwapDriverComponent } from "../actions/mobile/swap-driver/swap-driver.component";
import { SwapDevicesComponent } from "../actions/plugin/swap-devices/swap-devices.component";

import { MobileConnectivityComponent } from "../actions/mobile/mobile-connectivity/mobile-connectivity.component";
import { StopShipmentComponent } from "../actions/plugin/stop-shipment/stop-shipment.component";
import { EnrollmentDate20Component } from "../actions/common/enrollment-date/enrollment-date-20/enrollment-date-20.component";
import { DeviceRecoveryComponent } from "../actions/plugin/device-recovery/device-recovery.component";
import { CompatibilityEditComponent } from "../../compatibility/compatibility-edit/compatibility-edit.component";
import { InitialDiscountComponent } from "../actions/plugin/initial-discount/initial-discount.component";
import { CancelDeviceShipmentComponent } from "../actions/plugin/cancel-device-shipment/cancel-device-shipment.component";
import { CancelDeviceReplacementAction } from "../../../../../shared/data/enums";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-participant-actions",
    templateUrl: "./participant-actions.component.html",
    styleUrls: ["./participant-actions.component.scss"],
    standalone: false
})
export class ParticipantActionsComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {

	@Input() participant: Participant;

	isParticipantMobile: boolean;
	isParticipantOEM: boolean;
	isParticipantPlugin: boolean;

	private mobileRegistrations: Registration[];
	private mobileRegistrationCompleteCount: number;
	private participantCount: number;
	private isMaxPolicyPeriod: boolean;
	private isSnapshot3: boolean;
	private policy: Policy;
	private currentPolicyPeriod: PolicyPeriod;

	private commonMenuHasItems: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	commonMenuHasItems$: Observable<boolean> = this.commonMenuHasItems.asObservable();

	constructor(
		private appHelper: ResourceQuery,
		private changeDetection: ChangeDetectorRef,
		private registrationService: RegistrationService,
		private registrationDialogService: RegistrationDialogService,
		private deviceService: DeviceService,
		private dialogService: DialogService,
		private enumService: EnumService,
		private helper: HelperService,
		private labelService: LabelService,
		private mobileService: MobileService,
		private notificationService: NotificationService,
		private participantService: ParticipantService,
		private userInfoService: UserInfoService,
		private query: SnapshotPolicyQuery,
		private policyService: SnapshotPolicyService
	) { }

	ngOnInit(): void {
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.policy = x;
				this.currentPolicyPeriod = x.policyPeriodDetails ? x.policyPeriodDetails[x.policyPeriodDetails.length - 1] : undefined;
				this.isMaxPolicyPeriod = this.appHelper.getExtender(x, "IsMaxPolicyPeriod") === true;
				this.policy.policyNumber = x?.policyNumber;
				this.participantCount = x?.participants?.length;
				this.mobileRegistrationCompleteCount = x?.participants
					?.filter(p => this.helper.isParticipantMobile(p))
					.filter(p => p.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.Complete).length;
			}
		});
		this.query.policyRegistrations$.pipe(untilDestroyed(this)).subscribe(x => this.mobileRegistrations = x);
	}

	ngOnChanges(): void {
		this.isParticipantMobile = this.helper.isParticipantMobile(this.participant);
		this.isParticipantOEM = this.helper.isParticipantOEM(this.participant);
		this.isParticipantPlugin = this.helper.isParticipantPlugin(this.participant);
		this.isSnapshot3 = this.participant.snapshotDetails.programType === ProgramType.PriceModel3;
	}

	ngAfterViewInit(): void {
		this.changeDetection.detectChanges();
	}

	ngAfterViewChecked(): void {
		this.changeDetection.detectChanges();
	}

	shouldDisplayParticipantExcludeDateRange(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	openParticipantExcludeDateRangeDialog(): void {
		this.participantService.getExcludedDates(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Excluded Date Range",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: ExcludeDateRangeComponent,
				componentData: { participantId: this.participant.snapshotDetails.participantId, excludedDates: x },
				width: CUI_DIALOG_WIDTH.LARGE,
				helpKey: HelpText.ExcludedDateRange
			});
		});
	}

	shouldDisplayParticipantUbiValue(): boolean {
		if (this.isMaxPeriodAndNotTheftOnly() && !this.isParticipantOEM) {
			return true;
		}
		else {
			return false;
		}
	}

	openParticipantUbiScoreInfoDialog(): void {
		this.participantService.getUbiScoreData(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "UBI Value",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: SnapshotScoreInfoComponent,
				componentData: { scoreData: x, isMobile: this.isParticipantMobile },
				helpKey: HelpText.UBIValue
			});
		});
	}

	shouldDisplayParticipantOptOutSuspension(): boolean {
		// add Pending
		return this.isMaxPeriodAndNotTheftOnly() &&
			!this.isParticipantOEM &&
			this.userInfoService.data.hasOptOutSuspensionAccess &&
			[ParticipantReasonCode.CollectingData,
			ParticipantReasonCode.AutomatedOptInEndorsementPending
			].includes(this.participant.snapshotDetails.reasonCode)
			||
			(
				[ParticipantReasonCode.MobilePendingRegistration]
					.includes(this.participant.snapshotDetails.reasonCode) &&
				!!this.participant.mobileDeviceDetails.deviceSeqId)
			;
	}

	openParticipantOptOutSuspensionDialog(): void {
		this.participantService.getOptOutSuspensions(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Opt Out Suspension",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: OptOutSuspensionComponent,
				componentData: { participant: this.participant, suspensions: x },
				width: CUI_DIALOG_WIDTH.LARGE,
				helpKey: HelpText.OptOutSuspension
			});
		});
	}

	shouldDisplayParticipantRenewalScores(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.userInfoService.data.isInOpsAdminRole;
	}

	openParticipantRenewalScoresDialog(): void {
		this.participantService.getRenewalScoreData(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Renewal Score History",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: RenewalScoresComponent,
				componentData: x,
				width: CUI_DIALOG_WIDTH.FULL,
				helpKey: HelpText.RenewalScoreHistory
			});
		});
	}

	shouldDisplayParticipantTripSummary(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	openParticipantTripSummary(): void {
		this.participantService.getTripSummary(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Trip Summary",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: TripSummaryComponent,
				componentData: {
					isMobile: this.participant.snapshotDetails.enrollmentExperience === DeviceExperience.Mobile,
					algorithm: this.participant.snapshotDetails.scoringAlgorithmData,
					data: x
				},
				width: CUI_DIALOG_WIDTH.FULL,
				helpKey: HelpText.TripSummary
			});
		});
	}

	shouldDisplayParticipantUpdatePProGuid(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.userInfoService.data.hasUpdatePProGuidAccess;
	}

	openParticipantUpdatePProGuidDialog(): void {
		const title = "Update PolicyPro Guid";
		this.dialogService.openFormDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: UpdateGuidComponent,
			formModel: { guid: undefined },
			componentData: { participant: this.participant },
			width: CUI_DIALOG_WIDTH.MEDIUM
		});

		this.dialogService.confirmed<{ guid: string }>().subscribe(x => {
			if (x !== undefined) {
				this.dialogService.openConfirmationDialog({
					title,
					subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
					message: "Please confirm the following PolicyPro Guid update:<br/><br/>" +
						`<span class='inline-block pb-3 font-bold'>${x.guid}</span>` +
						"<br/>will replace<br/>" +
						`<span class='inline-block pt-3 font-bold'>${this.participant.snapshotDetails.participantId}</span>`
				});

				this.dialogService.confirmed<boolean>().subscribe(confirmed => {
					if (confirmed) {
						this.participantService.updatePproGuid(this.policy.policyNumber, this.participant.snapshotDetails.participantSeqId, x.guid).subscribe(_ => {
							this.participant.snapshotDetails.participantId = x.guid;
							this.query.updateParticipant(this.participant);
							this.notificationService.success(`${title} Successful`);
						});
					}
				});
			}
		});
	}

	shouldDisplayParticipantChangeEnrollmentDate(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			!this.isParticipantOEM &&
			this.userInfoService.data.hasResetEnrollmentAccess &&
			[
				ParticipantReasonCode.CollectingData,
				ParticipantReasonCode.NeedsDeviceAssigned,
				ParticipantReasonCode.DeviceReplacementNeeded,
				ParticipantReasonCode.AutomatedOptOutEndorsementPending
			].includes(this.participant.snapshotDetails.reasonCode);
	}

	openParticipantChangeEnrollmentDateDialog(): void {
		const is20 = this.participant.snapshotDetails.programType === ProgramType.PriceModel2;
		const title = "Change Enrollment Date";
		this.dialogService.openFormDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: is20 ? EnrollmentDate20Component : EnrollmentDateComponent,
			formModel: { enrollmentDate: undefined, shouldRecalculate: undefined, endorsementDate: undefined },
			componentData: { participant: this.participant },
			helpKey: HelpText.EnrollmentDateChange
		});

		this.dialogService.confirmed<{ enrollmentDate: Date; shouldRecalculate?: boolean; endorsementDate?: Date }>().subscribe(x => {
			if (x !== undefined) {
				const api = is20 ?
					this.participantService.updateEnrollmentDate20(this.policy.policyNumber, this.participant, x.enrollmentDate, x.endorsementDate, x.shouldRecalculate) :
					this.participantService.updateEnrollmentDate(this.policy.policyNumber, this.participant, x.enrollmentDate);

				api.subscribe(_ => this.notificationService.success(`${title} Successful`));
			}
		});
	}

	shouldDisplayMobileChangeNumber(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.participant.registrationDetails?.mobileRegistrationCode ? true : false;
	}

	openMobileChangeNumberDialog(): void {
		this.registrationDialogService.openRegistrationUpdateDialog(
			this.policy.policyNumber,
			this.participant,
			this.participant.registrationDetails,
			this.policyService.getPolicy(this.policy.policyNumber));
	}

	shouldDisplayCompatibility(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	feeReversalOnly(): boolean {
		return this.userInfoService.data.isInFeeReversalOnlyRole;
	}

	openCompatibilityDialog(): void {
		const item: CompatibilityItem = {
			compatibilityActionTakenXRef: [],
			compatibilitySeqId: 0,
			compatibilityTypeCode: null,
			createDateTime: new Date(),
			detailedDescription: "",
			deviceExperienceTypeCode: this.participant.snapshotDetails.enrollmentExperience,
			deviceSerialNumber: this.participant.pluginDeviceDetails?.deviceSerialNumber,
			emailAddress: null,
			lastChangeDateTime: new Date(),
			lastChangeUserId: null,
			mobileDeviceId: this.participant.mobileDeviceDetails?.deviceIdentifier,
			mobileDeviceModelName: this.participant.mobileDeviceDetails?.mobileDeviceModelName,
			mobileOSName: this.participant.mobileDeviceDetails?.mobileOSName,
			nonIssueFlag: false,
			participantSeqId: this.participant.snapshotDetails.participantSeqId,
			policyNumber: this.policy.policyNumber,
			programCode: ProgramCode.Snapshot,
			vehicleMake: this.participant.snapshotDetails.vehicleDetails?.make,
			vehicleModel: this.participant.snapshotDetails.vehicleDetails?.model,
			vehicleModelYear: this.participant.snapshotDetails.vehicleDetails?.year,
			extenders: null,
			messages: null
		};

		const title = "Add Compatibility Issue";
		this.dialogService.openFormDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: CompatibilityEditComponent,
			componentData: { deviceExperience: this.participant.snapshotDetails.enrollmentExperience },
			formModel: item,
			width: CUI_DIALOG_WIDTH.LARGE,
			helpKey: HelpText.Compatibility
		});

		this.dialogService.confirmed<CompatibilityItem>().subscribe(x => {
			if (x !== undefined) {
				this.participantService.addCompatibilityIssue(x).subscribe(success => {
					if (success) {
						this.notificationService.success(`${title} Successful`);
					}
					else {
						this.notificationService.error(`${title} Failed`);
					}
				});
			}
		});
	}

	shouldDisplayMobileConnectivity(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	openMobileConnectivityDialog(): void {
		this.mobileService.returnMobileContexts(this.participant.snapshotDetails.participantSeqId).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Mobile Connectivity",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: MobileConnectivityComponent,
				componentData: x,
				width: CUI_DIALOG_WIDTH.FULL,
				helpKey: HelpText.MobileConnectivity
			});
		});
	}

	shouldDisplaySwapDriver(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.isSnapshot3 &&
			this.participantCount >= 2 &&
			(this.participant.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.Complete);
	}

	openSwapDriverDialog(): void {
		const title = "Swap Drivers";
		this.dialogService.openFormDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: SwapDriverComponent,
			formModel: { destParticipant: undefined },
			componentData: this.participant,
			width: CUI_DIALOG_WIDTH.MEDIUM,
			helpKey: HelpText.SwapDrivers
		});

		this.dialogService.confirmed<{ destParticipant: number }>().subscribe(x => {
			if (x?.destParticipant !== undefined) {
				this.mobileService.swapDriver(this.policy.policyNumber, this.participant.snapshotDetails.participantSeqId, x.destParticipant).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
			}
		});

	}

	shouldDisplayMobileUnlockRegistration(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			(this.participant.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.Locked);
	}

	openMobileUnlockRegistrationDialog(): void {
		this.registrationDialogService.openUnlockDialog(this.participant, this.participant.registrationDetails, this.policyService.getPolicy(this.policy.policyNumber));
	}

	shouldDisplaySwitchMobileToOBD(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.isParticipantMobile &&
			this.isSnapshot3 &&
			(
				(this.participant.snapshotDetails.status === ParticipantStatus.Pending &&
					this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.MobilePendingRegistration) ||
				(this.participant.snapshotDetails.status === ParticipantStatus.Active &&
					this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.CollectingData)
			);
	}

	openMobileSwitchToOBDDialog(): void {
		const title = "Switch Mobile to Plug-in";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to switch this participant from<br/>Mobile to Plug-in?",
			helpKey: HelpText.SwitchMobileToOBD
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.mobileService.switchMobileToPlugin(this.policy.policyNumber, this.participant.snapshotDetails.participantSeqId).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
			}
		});
	}

	shouldDisplayDeviceDefective(): boolean {
		const device = this.participant.pluginDeviceDetails;
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.userInfoService.data.isInOpsAdminRole &&
			(device?.deviceSerialNumber ? true : false) &&
			!device?.wirelessStatus.toUpperCase().endsWith("DEFECTIVE") &&
			!device?.wirelessStatus.toUpperCase().endsWith("RMA") &&
			!device?.deviceReceivedDate &&
			!device?.deviceAbandonedDate;
	}

	openDeviceDefectiveDialog(): void {
		const title = "Mark Defective";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to mark this device as defective?",
			helpKey: HelpText.DeviceMarkDefective
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.markDeviceDefective(this.policy.policyNumber, this.participant).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
			}
		});
	}

	shouldDisplayDeviceAbandon(): boolean {
		const device = this.participant.pluginDeviceDetails;
		return this.isParticipantPlugin &&
			(device?.deviceSerialNumber ? true : false) &&
			!device?.deviceReceivedDate &&
			!device?.deviceAbandonedDate &&
			(
				(this.participant.snapshotDetails.status === ParticipantStatus.Active &&
					this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.DeviceReplacementNeeded) ||
				(this.participant.snapshotDetails.status === ParticipantStatus.Inactive &&
					this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.ParticipantOptedOut) ||
				(this.participant.snapshotDetails.status === ParticipantStatus.Unenrolled &&
					this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.ParticipantOptedOut)
			);
	}

	openDeviceAbandonDialog(): void {
		const title = "Mark Abandoned";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to mark this device as abandoned?",
			helpKey: HelpText.DeviceMarkAbandoned
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.abandonDevice(this.policy.policyNumber, this.participant,
					this.participant.pluginDeviceDetails?.deviceSerialNumber, this.currentPolicyPeriod.policySuffix, this.currentPolicyPeriod.expirationDate).subscribe(_ => {
						this.notificationService.success(`${title} Successful`);
					});
			}
		});
	}

	shouldDisplayActivateDevice(): boolean {
		const device = this.participant.pluginDeviceDetails;
		return this.isParticipantPlugin &&
			this.participant.snapshotDetails.status === ParticipantStatus.Active &&
			!device?.deviceReceivedDate &&
			(device?.deviceSerialNumber ? true : false) &&
			this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.CollectingData;
	}

	openDeviceActivateDialog(): void {
		const title = "Activate Device";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to activate this device?",
			helpKey: HelpText.ActivateDevice
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.activateDevice(this.policy.policyNumber, this.participant).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
			}
		});
	}

	getAudioDisplay(isAudioEnabled?: boolean): string {
		return isAudioEnabled ?? this.appHelper.getExtender(this.participant, "IsDeviceAudioEnabled") === true ? "ON" : "OFF";
	}

	setAudioDisplay(isAudioEnabled?: boolean): string {
		return isAudioEnabled ?? this.appHelper.getExtender(this.participant, "IsDeviceAudioEnabled") === false ? "ON" : "OFF";
	}

	shouldDisplayAudioToggle(): boolean {
		const device = this.participant.pluginDeviceDetails;
		return this.isMaxPeriodAndNotTheftOnly() &&
			device?.features?.includes(DeviceFeature.Audio) &&
			!device?.features?.includes(DeviceFeature.AWSIot) &&
			!device?.deviceReceivedDate &&
			!device?.deviceAbandonedDate;
	}

	isLegacyDevice(): boolean {
		const device = this.participant.pluginDeviceDetails;
		return !device?.features?.includes(DeviceFeature.AWSIot);
	}

	openDeviceAudioAWSDialog(): void {
		const title = "Audio Change";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: `Please click "OK" to get current audio status.`,
			confirmText: "OK",
			helpKey: HelpText.AudioManage
		});

		this.dialogService.confirmed<boolean>().subscribe(x => {
			if (x) {

				this.deviceService.getAudioStatus(this.participant).subscribe(currentAudioStatus => {

					this.dialogService.openConfirmationDialog({
						title,
						subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
						message: `Device audio is currently "${currentAudioStatus}". <br></br> Would you like to set audio for this device to "${currentAudioStatus.toUpperCase() === "On".toUpperCase() ? "Off" : "On"}"?`,
						confirmText: "Yes"
					});

					this.dialogService.confirmed<boolean>().subscribe(y => {
						if (y) {
							this.deviceService.setAudioStatus(this.participant, currentAudioStatus.toUpperCase() === "On".toUpperCase() ? false : true).subscribe(_ => {
								this.notificationService.success(`${title} Successful`);
							});
						}
					});

				});
			}
		});
	}

	openDeviceAudioDialog(): void {
		this.dialogService.openConfirmationDialog({
			title: "Set Audio",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to change the audio setting for this device?",
			helpKey: HelpText.AudioChange
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				const newAudioSetting = !this.appHelper.getExtender(this.participant, "IsDeviceAudioEnabled");
				this.deviceService.updateDeviceAudio(this.participant, newAudioSetting).subscribe(_ => {
					this.notificationService.success(`Audio Change Successful`);
				});
			}
		});
	}

	shouldDisplayAudioAWSToggle(): boolean {
		const device = this.participant.pluginDeviceDetails;
		return this.isMaxPeriodAndNotTheftOnly() &&
			device?.features?.includes(DeviceFeature.Audio) &&
			device?.features?.includes(DeviceFeature.AWSIot) &&
			!device?.deviceReceivedDate &&
			!device?.deviceAbandonedDate;
	}

	shouldDisplayPing(): boolean {
		const wirelessStatus = this.participant.pluginDeviceDetails?.wirelessStatus;
		return this.isMaxPeriodAndNotTheftOnly() &&
			wirelessStatus?.length >= 6 &&
			wirelessStatus?.toUpperCase().startsWith("ACTIVE");
	}

	openDevicePingDialog(): void {
		const title = "Ping Device";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to ping this device?"
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.pingDevice(this.participant).subscribe(_ => {
					this.notificationService.success(`Ping Sent to Device. \n If the device has not responded within 72 hours, try again.`);
				});
			}
		});
	}

	shouldDisplayConnectionTimeline(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.participant.pluginDeviceDetails?.deviceSerialNumber ? true : false;
	}

	shouldDisplayDeviceLocation(): boolean {
		return this.userInfoService.data.isInTheftRole ||
			this.userInfoService.data.isInTheftOnlyRole;
	}

	openDeviceLocationDialog(): void {
		this.deviceService.locationInformation(this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Device Location",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				componentData: {x , isLegacyDevice: this.isLegacyDevice()},
				component: DeviceLocationComponent,
				width: "110rem",
				helpKey: HelpText.DeviceLocation
			});
		});
	}

	openDeviceRecoveryDialog(): void {
		const subject = new Subject();
		this.dialogService.openFormDialog({
			title: "Device Recovery",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: DeviceRecoveryComponent,
			width: CUI_DIALOG_WIDTH.LARGE,
			componentData: { participantSeqId: this.participant.snapshotDetails.participantSeqId },
			formModel: { recoveryItems: undefined, originalRecoveryItems: undefined },
			helpKey: HelpText.DeviceRecovery
		});

		this.dialogService.confirmed<{ recoveryItems: DeviceRecoveryItem[]; originalRecoveryItems: DeviceRecoveryItem[] }>().subscribe(x => {
			if (x) {
				const deviceSeqIdsToSuspend = [];
				x.originalRecoveryItems.forEach((originalRecoveryItem, index) => {
					if (originalRecoveryItem.isAbandoned !== x.recoveryItems[index].isAbandoned && x.recoveryItems[index].isAbandoned) {
						this.deviceService.abandonDevice(this.policy.policyNumber, this.participant,
							originalRecoveryItem.deviceSerialNumber, this.currentPolicyPeriod.policySuffix, this.currentPolicyPeriod.expirationDate).subscribe(_ => {
								subject.next(true);
							});
					} else if (!x.recoveryItems[index].isAbandoned && originalRecoveryItem.isSuspended !== x.recoveryItems[index].isSuspended && x.recoveryItems[index].isSuspended) {
						deviceSeqIdsToSuspend.push(originalRecoveryItem.deviceSeqId);
					}

				});

				if (deviceSeqIdsToSuspend.length > 0) {
					this.deviceService.suspendDevice(deviceSeqIdsToSuspend, this.participant).subscribe(_ => {
						subject.next(true);
					});
				}
			}

			subject.subscribe(_ => {
				this.notificationService.success("Device Recovery Update Successful");
			});
		});
	}

	shouldDisplayDeviceRecovery(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	shouldDisplayInitialDiscount(): boolean {
		// only display if participant is 2.0 or participated in trial
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.userInfoService.data.isInOpsAdminRole &&
			(this.participant.snapshotDetails.programType === ProgramType.PriceModel2 ||
				(this.appHelper.getExtender(this.participant, "IsMigratedFromTrial") === true));
	}

	openInitialDiscountDialog(): void {
		this.deviceService.getInitialDiscountInfo(this.participant.snapshotDetails.participantSeqId).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Initial Discount Information",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: InitialDiscountComponent,
				componentData: {
					initialDiscountInfo: x,
					participant: this.participant,
					policyNumber: this.policy.policyNumber
				},
				width: CUI_DIALOG_WIDTH.LARGE,
				helpKey: HelpText.InitialDiscount
			});
		});
	}

	shouldDisplaySwapDevice(): boolean {
		const hasWirelessStatus = this.participant.pluginDeviceDetails?.wirelessStatus.length >= 6;
		const isRecycled = this.participant.pluginDeviceDetails?.deviceSerialNumber?.toUpperCase().indexOf("RECYCLED") > -1;

		return this.isMaxPeriodAndNotTheftOnly() &&
			this.participantCount > 1 &&
			hasWirelessStatus &&
			!isRecycled;
	}

	openDeviceSwapDialog(): void {
		const title = "Swap Devices";
		this.dialogService.openFormDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: SwapDevicesComponent,
			componentData: { selectedParticipant: this.participant },
			formModel: { destParticipant: undefined },
			helpKey: HelpText.DeviceSwap
		});

		this.dialogService.confirmed<{ destParticipant: Participant }>().subscribe(x => {
			if (x) {
				this.deviceService.swapDevices(this.policy.policyNumber, this.participant.snapshotDetails.participantSeqId, x.destParticipant.snapshotDetails.participantSeqId)
					.subscribe(_ => {
						this.notificationService.success(`${title} Successful`);
					});
			}
		});
	}

	shouldDisplayTrackShipment(): boolean {
		return this.isMaxPeriodAndNotTheftOnly();
	}

	openStopShipmentDialog(): void {
		this.dialogService.openFormDialog({
			title: "Stop Shipment",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: StopShipmentComponent,
			formModel: { stopShipmentMethod: undefined },
			helpKey: HelpText.StopShipment
		});

		this.dialogService.confirmed<{ stopShipmentMethod: string }>().subscribe(x => {

			if (x !== undefined) {
				let stopShipmentMethodDescription;
				let stopShipmentMethod;
				if (this.enumService.stopShipmentMethod.description(StopShipmentMethod.OptOut) === x.stopShipmentMethod) {
					stopShipmentMethod = StopShipmentMethod.OptOut;
					stopShipmentMethodDescription = this.enumService.stopShipmentMethod.description(StopShipmentMethod.OptOut);

				} else if (this.enumService.stopShipmentMethod.description(StopShipmentMethod.SetMonitoringComplete) === x.stopShipmentMethod) {
					stopShipmentMethod = StopShipmentMethod.SetMonitoringComplete;
					stopShipmentMethodDescription = this.enumService.stopShipmentMethod.description(StopShipmentMethod.SetMonitoringComplete);
				}

				this.dialogService.openConfirmationDialog({
					title: "Stop Shipment",
					subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
					message: "Are you sure you want to Stop Shipment for this participant? <br></br> Method: "
						+ stopShipmentMethodDescription + "<br></br>" + "Vehicle: "
						+ this.labelService.getDialogSubtitleForParticipant(this.participant),
					confirmText: "Yes"
				});

				this.dialogService.confirmed<boolean>().subscribe(confirmed => {
					if (confirmed) {
						this.deviceService.stopShipment(this.policy.policyNumber, this.currentPolicyPeriod.policyPeriodSeqId, this.participant, stopShipmentMethod).subscribe(_ => {
							this.notificationService.success("Participant status has been updated to " + (stopShipmentMethod === StopShipmentMethod.SetMonitoringComplete
								? "monitoring complete" : "opted out"));
						});
					}
				});
			}
		});

	}

	shouldDisplayStopShipment(): boolean {
		return this.isMaxPolicyPeriod &&
			this.userInfoService.data.hasStopShipmentAccess &&
			this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.NeedsDeviceAssigned;
	}

	openDeviceCancelReplaceDialog(): void {
		if (this.participant.snapshotDetails.reasonCode
			!== ParticipantReasonCode.NeedsDeviceAssigned) {
			this.dialogService.openFormDialog({
				title: "Cancel Device Replacement",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: CancelDeviceShipmentComponent,
				formModel: { CancelOption: undefined },
				componentData: {  },
				helpKey: HelpText.CancelDeviceReplacement
			});
			this.dialogService.confirmed<any>().subscribe(confirmed => {
				if (confirmed.stopShipmentMethod === this.enumService.cancelDeviceReplacementAction.description(CancelDeviceReplacementAction.PreviousDeviceActive)) {
					this.deviceService.updateAdminStatusToActive(
						this.policy.policyNumber,
						this.participant
					).subscribe(_ => {
						this.notificationService.success(` Successful`);
					});
				}
				else if (confirmed.stopShipmentMethod === this.enumService.cancelDeviceReplacementAction.description(CancelDeviceReplacementAction.OptOut)) {
					this.deviceService.updateAdminStatusForOptOut(
						this.policy.policyNumber,
						this.participant
					).subscribe(_ => {
						this.notificationService.success(` Successful`);
					});
				}
			});
		}
		else {
			const title = "Cancel Device Replacement";
			this.dialogService.openConfirmationDialog({
				title,
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				message: "Are you sure you want to cancel the device replacement for this participant?",
				helpKey: HelpText.CancelDeviceReplacement
			});

			this.dialogService.confirmed<boolean>().subscribe(confirmed => {
				if (confirmed) {
					this.deviceService.cancelReplacementDevice(this.policy.policyNumber, this.participant).subscribe(_ => {
						this.notificationService.success(`${title} Successful`);
					});
				}
			});
		}
	}

	shouldDisplayDeviceReplace(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.participant.snapshotDetails.status === ParticipantStatus.Active &&
			![
				ParticipantReasonCode.DeviceReplacementNeeded,
				ParticipantReasonCode.AutomatedOptOutEndorsementPending
			].includes(this.participant.snapshotDetails.reasonCode);
	}

	openDeviceReplaceDialog(): void {
		const title = "Replace Device";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to replace this device?",
			helpKey: HelpText.DeviceReplace
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.replaceDevice(this.policy.policyNumber, this.participant).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
			}
		});
	}

	shouldDisplayCancelReplace(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.DeviceReplacementNeeded;
	}

	shouldDisplayDeviceReset(): boolean {
		const wirelessStatus = this.participant.pluginDeviceDetails?.wirelessStatus;
		return this.isMaxPeriodAndNotTheftOnly() &&
			wirelessStatus?.length >= 6 &&
			wirelessStatus?.toUpperCase().startsWith("ACTIVE");
	}

	openDeviceResetDialog(): void {
		const title = "Remote Reset";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to reset this device?",
			helpKey: HelpText.RemoteReset
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.resetDevice(this.participant).subscribe(_ => {
					this.notificationService.success(`${title} Successful`);
				});
			}
		});
	}

	openTrackShipment(): void {
		const deviceSerialNumber = this.participant?.pluginDeviceDetails?.deviceSerialNumber;
		if (!deviceSerialNumber) {
			this.notificationService.error("No device serial number found for this participant.");
			return;
		}
		this.deviceService.getUspsShipTrackingNumber(deviceSerialNumber).subscribe(trackingNumber => {
			if (trackingNumber && trackingNumber.trim()) {
				const uspsUrl = `https://tools.usps.com/go/TrackConfirmAction_input?strOrigTrackNum=${trackingNumber}`;
				window.open(uspsUrl, "_blank");
			} else {
				this.notificationService.error("No USPS tracking number found. Opening UPS MI tracking page.");
				window.open("https://tracking.ups-mi.net/packageID", "_blank");
			}
		}, error => {
			this.notificationService.error("Failed to retrieve USPS tracking number. Opening UPS MI tracking page.");
			window.open("https://tracking.ups-mi.net/packageID", "_blank");
		});
	}

	private isMaxPeriodAndNotTheftOnly(): boolean {
		return this.isMaxPolicyPeriod &&
			!this.userInfoService.data.isInTheftOnlyRole;
	}

	openConnectionTimelineDialog(): void {
		this.deviceService.connectionTimeline(this.policy.policyNumber, this.participant).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Connection Timeline",
				subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
				component: ConnectionTimelineComponent,
				componentData: x,
				width: CUI_DIALOG_WIDTH.LARGE,
				helpKey: HelpText.ConnectionTimeline
			});

		});
	}

	shouldDisplayReEnroll(): boolean {
		return this.isMaxPeriodAndNotTheftOnly() &&
			this.participant.snapshotDetails.enrollmentExperience === DeviceExperience.Device &&
			this.participant.snapshotDetails.programType === ProgramType.PriceModel3 &&
			this.participant.snapshotDetails.status === ParticipantStatus.Inactive &&
			this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.ParticipantOptedOut &&
			this.participant.pluginDeviceDetails === undefined &&
			this.mobileRegistrations.some(x => x.participantExternalId === this.participant.telematicsId);
	}

	openReEnrollDialog(): void {
		this.dialogService.openConfirmationDialog({
			title: "Re-Enroll in Mobile",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			helpKey: HelpText.MobileReEnroll,
			message: `<b>System issues may result if the participant status in Policy Pro is not 'Enrolled'.
			See <a href="http://knowledgemanagement/Help/Document/Services_snapshotre30mobile" target="_blank">guidelines</a> for more details.</b><br/><br/>
			Are you sure you want to re-enroll this participant into Snapshot Mobile?`
		});

		this.dialogService.confirmed().subscribe(_ => {
			if (_) {
				const mobileReg = this.mobileRegistrations.find(x => x.participantExternalId === this.participant.telematicsId);
				this.deviceService.reEnrollInMobile(
					this.policy.policyNumber,
					this.participant.snapshotDetails.participantId,
					mobileReg.mobileRegistrationCode).subscribe(__ =>
						this.notificationService.success("Re-Enroll in Mobile Successful"));
			}
		});
	}
}
