import { Component, Input } from "@angular/core";

@Component({
    selector: "tmx-forbidden",
    templateUrl: "./forbidden.component.html",
    styleUrls: ["./forbidden.component.scss"],
    standalone: false
})
export class ForbiddenComponent {

	@Input() helpDeskNumber = "888-746-4500";

}
