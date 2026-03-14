import { AfterViewInit, Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { MobileRegistrationStatusSummary, ParticipantReasonCode, RegistrationStatusUpdateAction } from "@modules/shared/data/enums";
import { Participant, Policy, Registration } from "@modules/shared/data/resources";
import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { Observable } from "rxjs/internal/Observable";
import { tap } from "rxjs/operators";
import { HelpText } from "../../help/metadata";
import { RegistrationDialogService } from "../../services/registration-dialog.service";
import { RegistrationService } from "../../services/registration.service";
import { PolicyQuery } from "../../stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-mobile-registration",
    templateUrl: "./mobile-registration.component.html",
    styleUrls: ["./mobile-registration.component.scss"],
    standalone: false
})
export class MobileRegistrationComponent implements AfterViewInit, OnInit {

	@ViewChild(MatPaginator) paginator: MatPaginator;

	@Input() data: {
		policyQuery: PolicyQuery;
		policyRefresh$: Observable<Policy>;
		registrationRefresh$: Observable<Registration[]>;
	};

	dataSource: MatTableDataSource<Registration>;
	columns: string[] = ["phoneNum", "status", "challengeCode", "challengeExp"];

	participants: Participant[];
	registrations: Registration[];
	helpText = HelpText;

	selectedIndex: number;
	selectedRegistration: Registration;
	selectedParticipant: Participant;

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: {
			policyQuery: PolicyQuery;
			policyRefresh$: Observable<Policy>;
			registrationRefresh$: Observable<Registration[]>;
		},
		public enums: EnumService,
		private registrationService: RegistrationService,
		private registrationDialogService: RegistrationDialogService,
		private dialogService: DialogService,
		private notificationService: NotificationService,
		private labelService: LabelService,
		private resourceHelper: ResourceQuery) { }

	ngOnInit(): void {
		this.data = this.data || this.injectedData;

		this.data.policyQuery.mobileParticipants$.pipe(untilDestroyed(this)).subscribe(x => this.participants = x);
		this.data.policyQuery.policyRegistrations$.pipe(untilDestroyed(this)).subscribe(x => {
			this.registrations = x;
			if (this.registrations) {
				if (this.registrations?.map(y => y.driverFirstName + y.driverLastName).filter(y => y.length > 0).length > 0 &&
					this.columns.filter(y => y === "driver").length === 0) {
					this.columns.unshift("driver");
				}
				this.dataSource = new MatTableDataSource<Registration>(this.registrations);
				if (this.selectedIndex !== undefined) {
					this.selectRow(this.selectedIndex, this.registrations[this.selectedIndex]);
				}
			}
			else {
				this.selectedIndex = undefined;
			}
		});
	}

	ngAfterViewInit(): void {
		this.dataSource.paginator = this.paginator;
	}

	isChallengeExpired(registration: Registration): boolean {
		return this.resourceHelper.getExtender(registration, "ChallengeExpired");
	}

	isRegistrationPending(registration: Registration): boolean {
		return registration?.statusSummary === MobileRegistrationStatusSummary.PendingResolution;
	}

	selectRow(index: number, registration: Registration): void {
		this.selectedIndex = index;
		this.selectedRegistration = registration;
		this.selectedParticipant = this.participants.find(x => x.telematicsId === this.selectedRegistration.participantExternalId);
	}

	shouldDisableUnlock(): boolean {
		return this.selectedRegistration === undefined || this.selectedRegistration.statusSummary !== MobileRegistrationStatusSummary.Locked;
	}

	openUnlock(): void {
		this.registrationDialogService.openUnlockDialog(this.selectedParticipant, this.selectedRegistration, this.data.policyRefresh$);
	}

	shouldDisableReset(): boolean {
		return this.selectedRegistration === undefined ||
			this.selectedRegistration.challengeRequestCount >= 10 ||
			this.selectedParticipant?.snapshotDetails?.reasonCode === ParticipantReasonCode.PolicyCanceled;
	}

	openReset(): void {
		this.openConfirmationDialog(RegistrationStatusUpdateAction.Enable, HelpText.MobileRegistrationReset);
	}

	shouldDisableInactivate(): boolean {
		return this.selectedRegistration === undefined || this.selectedRegistration.statusSummary === MobileRegistrationStatusSummary.Inactive;
	}

	openInactivate(): void {
		this.openConfirmationDialog(RegistrationStatusUpdateAction.Inactive, HelpText.MobileRegistrationInactivate);
	}

	shouldDisableChangePhone(): boolean {
		return this.selectedRegistration === undefined;
	}

	openChangePhone(): void {
		this.registrationDialogService.openRegistrationUpdateDialog(this.data.policyQuery.activePolicyNumber,
			this.selectedParticipant, this.selectedRegistration, this.data.policyRefresh$);
	}

	refreshTable(): void {
		this.data.registrationRefresh$.subscribe(x => this.data.policyQuery.updatePolicyRegistrations(x));
	}

	private openConfirmationDialog(action: RegistrationStatusUpdateAction, helpKey?: string): void {
		const actionText = action === RegistrationStatusUpdateAction.Inactive ? "Inactivate" : "Reset";
		this.dialogService.openConfirmationDialog({
			title: `${actionText} Mobile Registration`,
			subtitle: this.selectedParticipant !== undefined ?
				this.labelService.getDialogSubtitleForParticipant(this.selectedParticipant) :
				`${this.selectedRegistration.driverFirstName} ${this.selectedRegistration.driverLastName}`,
			message: `Are you sure you want to ${actionText.toLowerCase()} this registration?`,
			helpKey,
			confirmText: "YES"
		});

		this.dialogService.confirmed().subscribe(() => {
			this.registrationService.updateRegistrationStatus(this.data.policyQuery.activePolicyNumber, this.selectedRegistration.mobileRegistrationSeqId, this.selectedRegistration?.participantExternalId, action)
				.pipe(tap(() => this.data.policyRefresh$.subscribe()))
				.subscribe(newStatus =>
					this.notificationService.success(
						`The Mobile Registration Status has been updated to ${this.enums.mobileRegistrationStatus.description(newStatus)}.`));
		});
	}
}
