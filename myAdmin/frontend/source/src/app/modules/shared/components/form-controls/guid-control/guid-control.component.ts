import { Component, Input } from "@angular/core";
import { TextControlComponent } from "../text-control/text-control.component";

@Component({
    selector: "tmx-guid-control",
    templateUrl: "./guid-control.component.html",
    styleUrls: ["./guid-control.component.scss"],
    standalone: false
})
export class GuidControlComponent extends TextControlComponent {

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
