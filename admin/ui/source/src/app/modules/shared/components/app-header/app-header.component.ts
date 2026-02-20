import { Component, Input } from "@angular/core";

@Component({
    selector: "tmx-app-header",
    templateUrl: "./app-header.component.html",
    styleUrls: ["./app-header.component.scss"],
    standalone: false
})
export class AppHeaderComponent {

	@Input() title = "";

	constructor() { }

}
