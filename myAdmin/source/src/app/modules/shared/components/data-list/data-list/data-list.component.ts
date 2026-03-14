import { Component, Input } from "@angular/core";

@Component({
    selector: "tmx-data-list",
    templateUrl: "./data-list.component.html",
    styleUrls: ["./data-list.component.scss"],
    standalone: false
})
export class DataListComponent {
	@Input() density: "condensed" | "normal" = "normal";
	@Input() border = true;
}
