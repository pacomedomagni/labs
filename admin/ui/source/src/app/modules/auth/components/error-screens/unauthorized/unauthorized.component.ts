import { Component, Input } from "@angular/core";

import { Router } from "@angular/router";

@Component({
    selector: "tmx-unauthorized",
    templateUrl: "./unauthorized.component.html",
    styleUrls: ["./unauthorized.component.scss"],
    standalone: false
})
export class UnauthorizedComponent {

	@Input() helpDeskNumber = "888-746-4500";

	loading: boolean;
	storageCleared: boolean;

	constructor(private router: Router) { }

	clearStorage(): void {
		this.loading = true;
		this.storageCleared = true;
		sessionStorage.clear();

		setTimeout(() => this.loading = false, 500);
	}

	reloadApp(): void {
		this.router.navigateByUrl("/");
	}
}
