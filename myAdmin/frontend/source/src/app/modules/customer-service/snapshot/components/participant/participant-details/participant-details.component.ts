import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { DialogService, HelperService, LabelService, UserInfoService } from "@modules/shared/services/_index";
import { HomebaseParticipantSummaryResponse, Participant } from "@modules/shared/data/resources";
import { MobileRegistrationStatusSummary, OptOutReasonCode, ParticipantReasonCode, ParticipantStatus, ProgramType } from "@modules/shared/data/enums";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { UIFormats } from "@modules/shared/data/ui-format";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { DeviceInformationDetailsComponent } from "./device-information-details/device-information-details.component";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-participant-details",
    templateUrl: "./participant-details.component.html",
    styleUrls: ["./participant-details.component.scss"],
    standalone: false
})
export class ParticipantDetailsComponent implements OnInit, OnChanges {

	@Input() participant: Participant;
	@Input() label: string;

	isParticipantMobile: boolean;
	isParticipantPlugin: boolean;
	isSnapshot3: boolean;
	isTheftOnlyRole: boolean;
	hasReturnDate: boolean;
	homebaseSummary: HomebaseParticipantSummaryResponse;

	formats = UIFormats;
	helpText = HelpText;
	optOutHelp: string;
	wirelessStatusAlert: string;
	mobileRegistrationAlert: string;
	enrollmentDateAlert: string;

	private latestInceptionDate: Date;

	constructor(
		public appHelper: ResourceQuery,
		public helper: HelperService,
		public labels: LabelService,
		public enums: EnumService,
		public query: SnapshotPolicyQuery,
		private dialogService: DialogService,
		private userInfoService: UserInfoService,
		private deviceService: DeviceService) { }

	ngOnInit(): void {
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.latestInceptionDate = x.policyPeriodDetails ? x.policyPeriodDetails[x.policyPeriodDetails.length - 1].inceptionDate : undefined;
			}
		});

		this.query.homebaseParticipantsSummaries$.pipe(untilDestroyed(this)).subscribe(x =>
			this.homebaseSummary = x?.filter(y => y?.telematicsId === this.participant?.telematicsId)[0]);
	}

	ngOnChanges(): void {
		this.isParticipantMobile = this.helper.isParticipantMobile(this.participant);
		this.isParticipantPlugin = this.helper.isParticipantPlugin(this.participant);
		this.isTheftOnlyRole = this.userInfoService.data.isInTheftOnlyRole;
		this.isSnapshot3 = this.participant.snapshotDetails.programType === ProgramType.PriceModel3;
		this.hasReturnDate = this.helper.isDeviceWithReturnDate(this.participant);
		this.enrollmentDateAlert = this.getEnrollmentDateAlert(this.latestInceptionDate);
		this.wirelessStatusAlert = this.triggerWirelessStatusAlert() ? HelpText.WirelessStatus : undefined;
		this.mobileRegistrationAlert = this.getMobileRegistrationStatusAlert();
		this.optOutHelp = this.triggerOptOutReasonHelp() ? (this.isParticipantMobile ? HelpText.OptOutReasonForMobile : HelpText.OptOutReasonForPlugin) : undefined;
	}

	openDeviceInfo(deviceSerialNumber: string): void {
		this.deviceService.deviceInfoDetails(deviceSerialNumber, this.participant.snapshotDetails.participantSeqId).subscribe(x => {
			this.dialogService.openInformationDialog({
				title: "Device Information",
				subtitle: `Vehicle: ${this.labels.getParticipantDisplayName(this.participant)}
				<p>  Device Serial#: ${deviceSerialNumber} </p>`,
				component: DeviceInformationDetailsComponent,
				componentData: x,
				width: CUI_DIALOG_WIDTH.FULL
			});
		});
	}

	getAlgorithmDisplay(): string {
		return this.participant.snapshotDetails.scoringAlgorithmData ?
			`${this.participant.snapshotDetails.scoringAlgorithmData.description} (${this.participant.snapshotDetails.scoringAlgorithmData.code})` :
			"UNKNOWN";
	}

	getParticipantStatusDisplay(): string {
		return this.participant.snapshotDetails.status === ParticipantStatus.Unenrolled &&
			this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.ParticipantOptedOut ?
			"Monitoring Complete" : this.enums.participantStatus.description(this.participant.snapshotDetails.status);
	}

	getParticipantReasonCodeDisplay(): string {
		return this.participant.snapshotDetails.status === ParticipantStatus.Unenrolled &&
			this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.ParticipantOptedOut ?
			"Monitoring Complete (1)" : `${this.enums.participantReasonCode.description(this.participant.snapshotDetails.reasonCode)}`;
	}

	getReportedVinDisplay(): string {
		const vin = this.participant.pluginDeviceDetails?.reportedVIN;
		return !vin ? "No VIN Reported" : vin;
	}

	getDeviceTypeDisplay(): string {
		return this.isParticipantMobile && !this.isParticipantPlugin ? "Mobile" :
			(!this.participant.pluginDeviceDetails?.deviceManufacturer ? "" :
				this.participant.pluginDeviceDetails.deviceManufacturer + " " + this.participant.pluginDeviceDetails.deviceVersion);
	}

	triggerWirelessStatusAlert(): boolean {
		return this.participant.snapshotDetails.status === ParticipantStatus.Active
			&& this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.CollectingData
			&& this.participant.pluginDeviceDetails?.wirelessStatus === "Inactive-Abandoned";
	}

	triggerMobileRegistrationStatusAlert(): boolean {
		return this.participant.snapshotDetails.status === ParticipantStatus.Active
			&& this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.CollectingData
			&& (this.participant.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.Disabled
				|| this.participant.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.Inactive);
	}

	triggerOptOutReasonHelp(): boolean {
		const today = new Date();
		const todayMinus30 = new Date();
		todayMinus30.setDate(today.getDate() - 30);
		return this.participant.snapshotDetails.optOutDetails?.reason === OptOutReasonCode.NonInstaller
			&& (this.participant.snapshotDetails.optOutDetails?.date?.getTime() > todayMinus30.getTime()
				&& this.participant.snapshotDetails.optOutDetails?.date?.getTime() < today.getTime());
	}

	private getMobileRegistrationStatusAlert(): string {
		if (this.triggerMobileRegistrationStatusAlert()) {
			return HelpText.MobileRegistrationAlert;
		}
		else if (this.participant.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.PendingResolution) {
			return HelpText.MobileRegistrationPending;
		}
		else {
			return undefined;
		}
	}

	getEnrollmentDateAlert(inceptionDate: Date): string {
		if ([ParticipantStatus.Active, ParticipantStatus.Pending].includes(this.participant.snapshotDetails.status) &&
			this.participant.snapshotDetails.enrollmentDate === undefined &&
			inceptionDate <= getToday()) {
			return HelpText.EnrollmentDateAlert;
		}
		else {
			return undefined;
		}
	}
}
