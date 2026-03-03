import { Component, Input } from "@angular/core";
import { InputControl } from "../input-controls.component";

@Component({
    selector: "tmx-text-options",
    templateUrl: "./text-options.component.html",
    styleUrls: ["./text-options.component.scss"],
    standalone: false
})
export class TextOptionsComponent {

	@Input() model: InputControl;

	constructor() { }

}
