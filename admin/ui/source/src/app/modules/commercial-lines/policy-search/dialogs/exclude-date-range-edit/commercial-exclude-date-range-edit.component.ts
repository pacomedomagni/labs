import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { ExcludedDateRange, ExcludedDateRangeReasonCode } from "@modules/shared/data/resources";
import { NgForm, NgModel } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { DateTimeModalComponent } from "@modules/shared/components/modals/date-time-modal/date-time-modal.component";

@Component({
    selector: "tmx-commercial-exclude-date-range-edit",
    templateUrl: "./commercial-exclude-date-range-edit.component.html",
    styleUrls: ["./commercial-exclude-date-range-edit.component.scss"],
    standalone: false
})
export class ClExcludeDateRangeEditComponent implements OnInit, AfterViewInit {

	@Input() model: ExcludedDateRange;
	@Input() reasonCodes: ExcludedDateRangeReasonCode[];
	@Input() parentForm: NgForm;
	@Input() participantSeqId: number;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;
	dateError: boolean = false;
	startDisabled: boolean;
	get minDate(): Date {
		if (this.model.rangeStart) {
			const date = new Date(this.model.rangeStart);
			date.setMinutes(date.getMinutes() + 1);
			return date;
		}
		else {
			return undefined;
		}
	}

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		 private dialog: MatDialog, private datePipe: DatePipe) {}

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.reasonCodes = this.reasonCodes || this.injectedData.data.reasonCodes;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.startDisabled = this.model.rangeEnd ? true : false;
		}

	openDateTime(field: "start" | "end") {
  		const isStart = field === "start";
  		const dialogRef = this.dialog.open(DateTimeModalComponent, {
		data: {
      		value: isStart ? this.model.rangeStart : this.model.rangeEnd,
      		label: isStart ? "Range Start Date" : "Range End Date",
      		min: isStart ? null : this.model.rangeStart,
			isDisabled: false
		}
		});

 	 	dialogRef.afterClosed().subscribe(result => {
			if (result) {
    			if (isStart) {
        			this.model.rangeStart = result;
      			} else {
					this.model.rangeEnd = result;
}
			}
		});
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => {
			this.parentForm.addControl(x);
		});
	}

	getErrorMessage(): string {
		const dateFormat = "M/d/yyyy hh:mm:ss";
		if (this.model.rangeStart && (this.compareDates(this.model.rangeStart, this.model.rangeEnd) > 0 ))
		{
			this.dateError = true;
			this.model.excludedDateRangeReasonCode = null;
			return `Date must be greater than ${this.datePipe.transform(this.model.rangeStart, dateFormat)}`;
		}
		this.dateError = false;
		return null;
	}

	compareDates(a: Date, b: Date): number {
        if (!a || !b) return null;
        const timeA = a.getTime();
        const timeB = b.getTime();
        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
    }

}
