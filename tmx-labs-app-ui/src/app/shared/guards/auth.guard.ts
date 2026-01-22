import { CanActivate, Router } from "@angular/router";
import { inject, Injectable } from "@angular/core";
import { OAuthService } from "angular-oauth2-oidc";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    private oauthService = inject(OAuthService);
    private router = inject(Router);

	canActivate(): boolean {

		const isAuthorized = this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken();
		if (isAuthorized) {
			return true;
		}
		else {
			this.router.navigateByUrl("/login");
		}
		return false;
	}
}
