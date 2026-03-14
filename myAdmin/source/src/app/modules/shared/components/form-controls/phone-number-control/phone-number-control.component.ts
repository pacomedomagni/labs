import { Component, EventEmitter, Output } from "@angular/core";
import { TextControlComponent } from "../text-control/text-control.component";

@Component({
    selector: "tmx-phone-number-control",
    templateUrl: "./phone-number-control.component.html",
    styleUrls: ["./phone-number-control.component.scss"],
    standalone: false
})
export class PhoneNumberControlComponent extends TextControlComponent {

	@Output() modelChange = new EventEmitter<string>();
	@Output() keyUpEnter = new EventEmitter<KeyboardEvent>();

	constructor() { super(); }

	onChangeEvent(event: Event): void {
		super.onChangeEvent(event);
	}

	onKeyEnterEvent(event: KeyboardEvent): void {
		super.onKeyEnterEvent(event);
	}

	getErrorMessage(): string {
		return super.getErrorMessage();
	}

}
