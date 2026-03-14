import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { Participant } from "@modules/shared/data/resources";
import { ProgramType } from "@modules/shared/data/enums";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-enrollment-date",
    templateUrl: "./enrollment-date.component.html",
    styleUrls: ["./enrollment-date.component.scss"],
    standalone: false
})
export class EnrollmentDateComponent implements OnInit, AfterViewInit {

	@Input() model: { enrollmentDate: Date };
	@Input() participant: Participant;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	preCheckCompleted = false;
	preCheckPassed = false;
	preCheckError: string;

	private earliestInceptionDate: Date;
	private currentInceptionDate: Date;
	private initialFirstContactDate: Date;
	private programType: string;
	private today: Date = getToday();

	get minDate(): Date {
		if (this.useCurrentInceptionDate())
		{
			return this.currentInceptionDate;
		}
		else
		{
		 return [this.earliestInceptionDate, this.initialFirstContactDate]
		 	.filter(x => x !== undefined)
		 	.reduce((x, y) => x > y ? x : y);
		}
	}

	get maxDate(): Date {
		return this.today;
	}

	currentEnrollmentDate: Date;

	constructor(@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any, private query: SnapshotPolicyQuery) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.currentEnrollmentDate = this.injectedData.data.participant.snapshotDetails.enrollmentDate;
		this.initialFirstContactDate = this.injectedData.data.participant.snapshotDetails.initialFirstContactDateTime;
		this.programType = this.injectedData.data.participant.snapshotDetails.programType;
		if(this.useCurrentInceptionDate()) {
			this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
				this.currentInceptionDate = x.snapshotDetails.inceptionDate;
				this.runPreChecks(this.currentInceptionDate);
			});
		}
		else {
			this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
				this.earliestInceptionDate = x.policyPeriodDetails.map(y => y.inceptionDate).reduce((y, z) => y < z ? y : z);
				this.runPreChecks(this.earliestInceptionDate);
			});
		}
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

	private runPreChecks(policyInceptionDate: Date): void {
		if (policyInceptionDate > this.today) {
			this.preCheckError = "Cannot change Enrollment Date on future dated policy terms";
		}

		this.preCheckPassed = this.preCheckError === undefined;
		this.preCheckCompleted = true;
	}

	private useCurrentInceptionDate(): Boolean {
		return (this.programType === ProgramType.PriceModel5);
	}
}
