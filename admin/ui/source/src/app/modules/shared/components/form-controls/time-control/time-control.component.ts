import { Component, Input, Output, EventEmitter } from "@angular/core";
import { BaseControlComponent } from "../base-control/base-control.component";

@Component({
	selector: "tmx-time-control",
	templateUrl: "./time-control.component.html",
	styleUrls: ["./time-control.component.scss"],
	standalone: false
})
export class TimeControlComponent extends BaseControlComponent {
	@Input() label: string = "";
	@Input() id: string = "";
	@Input() name: string = "";
	@Input() isDisabled: boolean = false;
	@Input() model: string = "";
	@Output() modelChange = new EventEmitter<Date>();

	constructor() { super(); }

	onTimeChange(event: any): void {
		this.modelChange.emit(event);
	}
}
