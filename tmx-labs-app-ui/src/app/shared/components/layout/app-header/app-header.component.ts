import { Component } from "@angular/core";
import { BreadcrumbComponent } from "xng-breadcrumb";

@Component({
	selector: "tmx-app-header",
	templateUrl: "./app-header.component.html",
	styleUrls: ["./app-header.component.scss"],
	standalone: true,
	imports: [BreadcrumbComponent]
})
export class AppHeaderComponent {
	
}
