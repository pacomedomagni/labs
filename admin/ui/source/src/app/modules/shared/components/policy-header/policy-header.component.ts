import { ApplicationGroupIds } from "@modules/shared/data/_index";
import { Component } from "@angular/core";

@Component({
    selector: "tmx-policy-header",
    templateUrl: "./policy-header.component.html",
    styleUrls: ["./policy-header.component.scss"],
    standalone: false
})
export class PolicyHeaderComponent {

	portalLink = ApplicationGroupIds.Portal;

	constructor() { }

}
