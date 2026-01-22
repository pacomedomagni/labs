import { Component } from "@angular/core";

@Component({
	standalone: true,
	selector: "tmx-auth-spinner",
	styleUrls: ["./spinner.component.scss"],
	template: `
	<div class="preloader">
			<img class="logo" src="assets/icons/pgr-p.svg" alt="Loading" aria-hidden="true"/>
			<div class="preloader-1"></div>
			<div class="spin-all">
				<div class="preloader-2"></div>
				<div class="preloader-3"></div>
				<div class="preloader-4"></div>
				<div class="preloader-5"></div>
			</div>
		</div>
	`
})
export class AuthSpinnerComponent {

}
