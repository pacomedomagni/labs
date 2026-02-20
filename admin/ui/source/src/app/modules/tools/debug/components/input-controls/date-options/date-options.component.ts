import { Component, Input } from "@angular/core";
import { InputControl } from "../input-controls.component";

@Component({
    selector: "tmx-date-options",
    templateUrl: "./date-options.component.html",
    styleUrls: ["./date-options.component.scss"],
    standalone: false
})
export class DateOptionsComponent {

	@Input() model: InputControl;

	constructor() { }
}
