import { Component, Input } from "@angular/core";
import { InputControl } from "../input-controls.component";

@Component({
    selector: "tmx-common-options",
    templateUrl: "./common-options.component.html",
    styleUrls: ["./common-options.component.scss"],
    standalone: false
})
export class CommonOptionsComponent {

	@Input() model: InputControl;

	constructor() { }

}
