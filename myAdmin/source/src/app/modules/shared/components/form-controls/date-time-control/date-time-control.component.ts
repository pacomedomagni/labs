import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseControlComponent } from "../base-control/base-control.component";

@Component({
    selector: "tmx-date-time-control",
    templateUrl: "./date-time-control.component.html",
    styleUrls: ["./date-time-control.component.scss"],
    standalone: false
})
export class DateTimeControlComponent extends BaseControlComponent implements AfterViewInit {

	dateChange: Date | null = null;
	timeChange: string = "";
	initialDate: Date | null = null;
	initialTime: string = "";
	@Input() min: Date;
	@Input() max: Date;
	@Input() label: string = "";
	@Output() modelChange = new EventEmitter<Date>();
	displayError: boolean = false;
	private dateFormat = "M/d/yyyy hh:mm:ss";

	constructor(private datePipe: DatePipe) {
		super();
		if (this.model instanceof Date) {
			this.dateChange = new Date(this.model);
			this.timeChange = this.model.toTimeString().slice(0, 8);
		}
	}

	ngAfterViewInit(): void {
		this.model.setSeconds(0);
		this.initialDate = new Date(this.model);
		this.initialTime = this.initialDate.toTimeString().slice(0, 8);
		if(this.model) {
			this.isRequired = false;
		}

	}

	onDateChange(event: any): void {
		this.dateChange = new Date(event);
		this.updateModel();
	}

	onTimeChange(event: Date | string): void {
		if (typeof event === "string") {
			this.timeChange = event;
		} else if (event instanceof Date) {
			this.timeChange = event.toTimeString().slice(0,8);
		}
		this.updateModel();
	}

	updateModel(): void {
		if (this.dateChange && this.timeChange) {
			const [hours, minutes, seconds] = this.timeChange.split(":").map(Number);
			const combined = new Date(this.dateChange);
			combined.setHours(hours || 0, minutes || 0, seconds || 0, 0);
			this.model = combined;
			this.modelChange.emit(this.model);
		} else if (this.dateChange && !this.timeChange) {
			const [hours, minutes, seconds] = this.initialTime.split(":").map(Number);
			const combined = new Date(this.dateChange);
			combined.setHours(hours || 0, minutes || 0, seconds || 0, 0);
			this.model = combined;
			this.modelChange.emit(this.model);
		}else if (!this.dateChange && this.timeChange) {
			const [hours, minutes, seconds] = this.timeChange.split(":").map(Number);
			const combined = new Date(this.initialDate);
			combined.setHours(hours || 0, minutes || 0, seconds || 0, 0);
			this.model = combined;
			this.modelChange.emit(this.model);
		}
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

