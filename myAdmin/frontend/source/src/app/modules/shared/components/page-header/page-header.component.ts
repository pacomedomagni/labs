import { Component, Input } from "@angular/core";

@Component({
    selector: "tmx-page-header",
    templateUrl: "./page-header.component.html",
    styleUrls: ["./page-header.component.scss"],
    standalone: false
})

export class PageHeaderComponent {
	@Input() headerText: string;

	constructor() { }
}
