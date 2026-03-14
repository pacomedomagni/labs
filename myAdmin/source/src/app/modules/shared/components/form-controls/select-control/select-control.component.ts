import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseControlComponent } from "../base-control/base-control.component";

@Component({
    selector: "tmx-select-control",
    templateUrl: "./select-control.component.html",
    styleUrls: ["./select-control.component.scss"],
    standalone: false
})
export class SelectControlComponent extends BaseControlComponent {

	@Input() options: SelectListItem<any>[];

	@Output() modelChange = new EventEmitter<any>();
	@Output() selectionChange = new EventEmitter<any>();

	constructor() { super(); }

	onSelectionChange(value: any): void {
		this.modelChange.emit(value);
		this.selectionChange.emit(value);
	}
}

export class SelectListItem<T> {
	value: T;
	display?: string;
}
