import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Injectable, inject } from "@angular/core";
import { Observable, tap, map } from "rxjs";
import { metadata as Portal } from "../../portal/metadata";
import { UserInfoService } from "../services/user-info/user-info.service";
import { ApplicationGroupMetadata, ApplicationMetadata } from "../data/application/application.interface";
import { applicationGroups } from "../data/application/applications-metadata";

@Injectable({
	providedIn: "root"
})
export class ExternalRedirectGuard implements CanActivate {

	routeParts: string[];
	app: ApplicationGroupMetadata | ApplicationMetadata;

	private router = inject(Router);
	private userInfoService = inject(UserInfoService);

	constructor() {
		this.userInfoService.getUserInfo().subscribe((u) => {
			console.log(u);
			this.process(this.app || Portal);
		});
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
		this.routeParts = state.url.split("/").filter(x => x !== "");
		let app: ApplicationGroupMetadata | ApplicationMetadata;
		if (this.routeParts.length === 1 || this.routeParts[0] === route.routeConfig.path) {
			app = applicationGroups.filter(x => x.id === this.routeParts[0])[0];
		}
		else {
			app = applicationGroups.filter(x => x.id === this.routeParts[0])[0].applications
				.filter(x => x.id === this.routeParts[this.routeParts.length - 1])[0];
		}
		return this.process(app);
	}

	process(app: ApplicationGroupMetadata | ApplicationMetadata): Observable<boolean> | boolean {
		if (app.isReady) {
			return this.userInfoService.userInfo$.pipe(
				tap((userInfo) => {
					if (!userInfo) {
						const allowed = this.userInfoService.getUserAccess(app.access);
						if (!allowed) {
							this.router.navigateByUrl("/Portal");
						}
					}
				}),
				// Map to boolean: true if allowed, false otherwise
				// This ensures an Observable<boolean> is always returned
				// Use map operator to return the correct value
				// Import map from rxjs if not already imported
				// import { map } from "rxjs";
				map((userInfo) => {
					if (!userInfo) {
						const allowed = this.userInfoService.getUserAccess(app.access);
						return !!allowed;
					}
					return false;
				})
			);
		}
		else {
			//const prefix = ConfigurationSettings.appSettings.environment.prefix;
			//const envUrl = ConfigurationSettings.appSettings.environment.isProduction ? app.externalInfo.url : app.externalInfo.url.replace("//", "//" + prefix + "-");
			//window.open(envUrl, "_blank");
			return false;
		}
	}
}
