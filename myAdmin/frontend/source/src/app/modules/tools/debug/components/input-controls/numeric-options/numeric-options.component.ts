import { Component, Input } from "@angular/core";
import { InputControl } from "../input-controls.component";

@Component({
    selector: "tmx-numeric-options",
    templateUrl: "./numeric-options.component.html",
    styleUrls: ["./numeric-options.component.scss"],
    standalone: false
})
export class NumericOptionsComponent {

	@Input() model: InputControl;

	constructor() { }

}
