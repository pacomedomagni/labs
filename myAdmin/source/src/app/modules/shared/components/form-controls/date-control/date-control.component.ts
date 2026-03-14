import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseControlComponent } from "../base-control/base-control.component";

@Component({
    selector: "tmx-date-control",
    templateUrl: "./date-control.component.html",
    styleUrls: ["./date-control.component.scss"],
    standalone: false
})
export class DateControlComponent extends BaseControlComponent {

	@Input() label: string = "";
	@Input() id: string = "";
	@Input() name: string = "";
	@Input() isDisabled: boolean = false;
	@Input() min: Date;
	@Input() max: Date;
	@Input() model: Date;
	displayError: boolean = false;

	@Output() modelChange = new EventEmitter<Date>();

	private dateFormat = "M/d/yyyy hh:mm:ss";

	constructor(private datePipe: DatePipe) { super(); }

	onDateChange(): void {
		this.modelChange.emit(this.model);
	}

	getErrorMessage(): string {
		if (this.min && (this.compareDates(this.model, this.min) < 0))
		{
			this.displayError = true;
			return `Date must be greater than ${this.datePipe.transform(this.min, this.dateFormat)}`;
		}
		else if (this.max && (this.compareDates(this.model, this.max) > 0))
		{
			this.displayError = true;
			return `Date must be less than ${this.datePipe.transform(this.max, this.dateFormat)}`;
		}
		else if (this.min && this.max) {
			this.displayError = true;
			return `Date must be between ${this.datePipe.transform(this.min, this.dateFormat)} and ${this.datePipe.transform(this.max, this.dateFormat)}`;
		}
		else if (!this.model && this.isRequired)
		{
			this.displayError = true;
			return "Date is required";
		}
		else
		{
			this.displayError = false;
			return null;
		}
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
