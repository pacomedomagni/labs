import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseControlComponent } from "../base-control/base-control.component";

@Component({
    selector: "tmx-text-control",
    templateUrl: "./text-control.component.html",
    styleUrls: ["./text-control.component.scss"],
    standalone: false
})
export class TextControlComponent extends BaseControlComponent {

	@Input() minlength: number;
	@Input() maxlength: number;
	@Input() exactLength: number;

	@Output() modelChange = new EventEmitter<string>();
	@Output() keyUpEnter = new EventEmitter<KeyboardEvent>();

	constructor() { super(); }

	onChangeEvent(event: Event): void {
		this.model = event;
		this.modelChange.emit(this.model);
	}

	onKeyEnterEvent(event: KeyboardEvent): void {
		if (this.keyUpEnter && this.control.valid) {
			this.keyUpEnter.emit(event);
		}
	}

	getErrorMessage(): string {
		if (this.model?.length > 1) {
			if (this.exactLength) {
				return `Input must equal ${this.exactLength} characters`;
			}
			else if (this.minlength && !this.maxlength) {
				return `Input must be greater than ${this.minlength} characters`;
			}
			else if (!this.minlength && this.maxlength) {
				return `Input must be less than ${this.maxlength} characters`;
			}
			else if (this.minlength && this.maxlength) {
				return `Input must be between ${this.minlength} and ${this.maxlength} characters`;
			}
			else {
				return super.getErrorMessage();
			}
		}
		else {
			return super.getErrorMessage();
		}
	}
}
