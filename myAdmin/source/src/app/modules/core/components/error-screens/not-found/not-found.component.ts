import { Component, Input } from "@angular/core";

@Component({
    selector: "tmx-not-found",
    templateUrl: "./not-found.component.html",
    styleUrls: ["./not-found.component.scss"],
    standalone: false
})

export class NotFoundComponent {
	@Input() helpDeskNumber = "888-746-4500";
}
