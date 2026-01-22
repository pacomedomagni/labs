import { AuthConfig, OAuthService } from "angular-oauth2-oidc";
import { BehaviorSubject, Observable } from "rxjs";

import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { filter } from "rxjs/operators";

export interface IAuthConfig extends AuthConfig {
	discoveryDoc: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {

	private uriFields = ["issuer", "loginUrl", "logoutUrl", "tokenEndpoint", "userinfoEndpoint", "revocationEndpoint"];
	private config: IAuthConfig;

	private isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(undefined);
	public isAuthenticated$: Observable<boolean> = this.isAuthenticated.asObservable();

	private oauthService = inject(OAuthService);
	private router = inject(Router);

	constructor() {
		this.oauthService.events
			.pipe(filter(e => e.type === "token_expires"))
			.subscribe(() => {
				localStorage.clear();
			});

		// Useful for debugging:
		/* this.oauthService.events.subscribe(event => {
			if (event instanceof OAuthErrorEvent) {
				console.error('OAuthErrorEvent Object:', event);
			} else {
				console.warn('OAuthEvent Object:', event);oauth
			}
		}); */
	}

	configure(config: IAuthConfig): void {
		this.config = config;
		this.oauthService.configure(this.config);

		const isAuthorized = this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken();
		this.isAuthenticated.next(isAuthorized);
	}

	login(unauthCallback: () => void = (() => this.initCodeFlow())): void {
		this.oauthService.loadDiscoveryDocument(window.location.origin + this.config.discoveryDoc).then(() => {
			if (!this.oauthService.redirectUri?.startsWith("http")) {
				this.oauthService.redirectUri = window.location.origin + this.oauthService.redirectUri;
			}
			this.uriFields.forEach(f =>
				this.oauthService[f] = this.oauthService[f].replace("${OAUTH_ISSUER}", this.config.issuer)
			);

			this.oauthService.tryLogin().then(() => {
				if (!this.oauthService.hasValidIdToken() || !this.oauthService.hasValidAccessToken()) {
					this.isAuthenticated.next(false);
					unauthCallback();
				}
				else {
					this.isAuthenticated.next(true);
					this.router.navigateByUrl("/");
				}
			});
		});
	}

	private initCodeFlow(): void {
		this.oauthService.initCodeFlow();
	}

}
