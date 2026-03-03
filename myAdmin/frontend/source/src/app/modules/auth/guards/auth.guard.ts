import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { Injectable } from "@angular/core";
import { OAuthService } from "angular-oauth2-oidc";

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(private oauthService: OAuthService, private router: Router) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): boolean {

		const isAuthorized = this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken();

		if (isAuthorized) {
			return true;
		}
		else {
			this.router.navigateByUrl("/login");
		}
	}
}
