import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { ParticipantService } from "@modules/customer-service/snapshot/services/participant.service";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { ParticipantReasonCode } from "@modules/shared/data/enums";
import { InitialParticipantScoreInProcess, Participant } from "@modules/shared/data/resources";
import { getToday, getXAdjustedDays } from "@modules/shared/utils/datetime-utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-enrollment-date-20",
    templateUrl: "./enrollment-date-20.component.html",
    styleUrls: ["./enrollment-date-20.component.scss"],
    standalone: false
})
export class EnrollmentDate20Component implements OnInit, AfterViewInit {

	@Input() model: { enrollmentDate: Date; shouldRecalculate: boolean; endorsementDate?: Date };
	@Input() participant: Participant;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	private today: Date = getToday();
	private earliestInceptionDate: Date = getToday();
	private datesOlderThan30: boolean;
	private thirtyDaysAgo: Date;

	get minDate(): Date {
		let date = new Date(this.earliestInceptionDate);
		if (this.selectedPProStatus === 1 && this.earliestInceptionDate < this.thirtyDaysAgo) {
			date = new Date(this.today);
			date.setDate(date.getDate() - 30);
		}
		return date;
	}

	get maxDate(): Date {
		const date = new Date(this.today);
		if (this.selectedPProStatus === 4 && this.earliestInceptionDate < this.thirtyDaysAgo) {
			date.setDate(date.getDate() - 31);
		}
		return date;
	}

	currentEnrollmentDate: Date;
	preCheckCompleted = false;
	preCheckPassed = false;
	preCheckError: string;
	isScoreCalculated: boolean;

	selectedPProStatus: number;
	pproStatuses = [
		{ id: 1, description: "Enrolled" },
		{ id: 4, description: "Initial Discount" }
	];

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		private participantService: ParticipantService,
		private query: SnapshotPolicyQuery) {

	}

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.participant = this.participant || this.injectedData.data.participant;
		this.currentEnrollmentDate = this.participant.snapshotDetails.enrollmentDate;
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			this.earliestInceptionDate = x.policyPeriodDetails.map(y => y.inceptionDate).reduce((y, z) => y < z ? y : z);
			this.thirtyDaysAgo = getXAdjustedDays(-30);
			this.datesOlderThan30 = this.currentEnrollmentDate <= this.thirtyDaysAgo && this.earliestInceptionDate <= this.thirtyDaysAgo;
			this.participantService.getInitialParticipantScoreInProcess(this.participant.snapshotDetails.participantSeqId)
				.subscribe(data => this.runPreChecks(this.earliestInceptionDate, data));
		});
	}

	private runPreChecks(policyInceptionDate: Date, initialScoreInProcess?: InitialParticipantScoreInProcess): void {
		if (policyInceptionDate > this.today) {
			this.preCheckError = "Cannot change Enrollment Date on future dated policy terms";
		}
		else if (this.participant.snapshotDetails.reasonCode === ParticipantReasonCode.NeedsDeviceAssigned) {
			this.preCheckError = "Cannot change Enrollment Date until a plug-in device has been assigned";
		}
		else if (initialScoreInProcess === null || initialScoreInProcess === undefined) {
			this.preCheckError = `Initial Score data is missing for this Snapshot 2.0 vehicle.\n\nTo resolve this issue:\n(1) open the Initial Discount action and\n(2) select 'Insert Record'`;
		}
		this.preCheckPassed = this.preCheckError === undefined;
		this.preCheckCompleted = true;
		this.isScoreCalculated = initialScoreInProcess?.isScoreCalculated;
		this.model.endorsementDate = initialScoreInProcess?.endorsementAppliedDate;
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

	areMinMaxDatesEqual(): boolean {
		return this.minDate === this.maxDate;
	}

	shouldDisableNewEnrollmentDate(): boolean {
		if (this.selectedPProStatus === undefined) {
			return true;
		}

		if (this.areMinMaxDatesEqual()) {
			this.model.enrollmentDate = this.minDate;
			return true;
		}

		return false;
	}

	clearEnrollment(): void {
		this.model.enrollmentDate = undefined;
		this.model.shouldRecalculate = this.isScoreCalculated && this.selectedPProStatus === 4 && this.datesOlderThan30 ? false : true;
	}
}
