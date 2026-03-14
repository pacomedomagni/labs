import { Component, Input } from "@angular/core";
import { TextControlComponent } from "../text-control/text-control.component";

@Component({
    selector: "tmx-numeric-control",
    templateUrl: "./numeric-control.component.html",
    styleUrls: ["./numeric-control.component.scss"],
    standalone: false
})
export class NumericControlComponent extends TextControlComponent {

	@Input() min: number;
	@Input() max: number;
	@Input() step: number;

	constructor() { super(); }

	onChangeEvent(): void {
		this.modelChange.emit(this.model);
	}

	getErrorMessage(): string {
		if (this.min && !this.max) {
			return `Number must be greater than ${this.min}`;
		}
		else if (!this.min && this.max) {
			return `Number must be less than ${this.max}`;
		}
		else if (this.min && this.max) {
			return `Number must be between ${this.min} and ${this.max}`;
		}
		else {
			return super.getErrorMessage();
		}
	}
}
