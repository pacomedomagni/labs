import { Component, OnInit, inject } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { AuthSpinnerComponent } from "./spinner/spinner.component";


@Component({
	standalone: true,
	selector: "tmx-sso-login",
	imports: [AuthSpinnerComponent],
	template: `
	<tmx-auth-spinner></tmx-auth-spinner>
	`
})
export class SsoLoginComponent implements OnInit {

	private authService = inject(AuthService);

	ngOnInit(): void {
		this.authService.login();
	}

}
