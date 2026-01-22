import { AfterViewInit, Component, inject } from "@angular/core";

import { Router } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import { AuthSpinnerComponent } from "./spinner/spinner.component";

@Component({
	standalone: true,
	imports: [AuthSpinnerComponent],
	selector: "tmx-oauth-sso-callback",
	template: `
	<tmx-auth-spinner></tmx-auth-spinner>
`
})
export class OAuthSsoCallbackComponent implements AfterViewInit {

	private router = inject(Router);
	private authService = inject(AuthService);

	ngAfterViewInit(): void {
		const queryParms = this.decodeURLParams(window.location.search.substring(1));

		if (queryParms.code === undefined) {
			this.redirectUnauth();
		}
		else {
			this.authService.login(() => this.redirectUnauth);
		}
	}

	private redirectUnauth(): void {
		this.router.navigateByUrl("/unauthorized");
	}

	decodeURLParams = search => {
		const hashes = search.slice(search.indexOf("?") + 1).split("&");
		return hashes.reduce((params, hash) => {
			const split = hash.indexOf("=");

			if (split < 0) {
				return Object.assign(params, {
					[hash]: null
				});
			}

			const key = hash.slice(0, split);
			const val = hash.slice(split + 1);

			return Object.assign(params, { [key]: decodeURIComponent(val) });
		}, {});
	};

}
