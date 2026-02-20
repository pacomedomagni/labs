import { Component } from "@angular/core";

@Component({
    selector: "tmx-auth-spinner",
    styleUrls: ["./spinner.component.scss"],
    template: `
	<div class="preloader">
			<img class="logo" src="assets/pgr-p.svg" />
			<div class="preloader-1"></div>
			<div class="spin-all">
				<div class="preloader-2"></div>
				<div class="preloader-3"></div>
				<div class="preloader-4"></div>
				<div class="preloader-5"></div>
			</div>
		</div>
	`,
    standalone: false
})
export class AuthSpinnerComponent {

	constructor() { }

}
