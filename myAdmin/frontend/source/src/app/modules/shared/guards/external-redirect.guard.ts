import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { ConfigurationSettings } from "@modules/core/services/configuration/config-info";
import { Observable, tap } from "rxjs";
import { metadata as Portal } from "@modules/portal/metadata";
import { ApplicationGroupMetadata, ApplicationMetadata, applicationGroups } from "../data/_index";
import { UserInfoService } from "../services/user-info/user-info.service";

@Injectable({
	providedIn: "root"
})
export class ExternalRedirectGuard implements CanActivate {

	routeParts: any;
	app: ApplicationGroupMetadata | ApplicationMetadata;

	constructor(private router: Router, private userInfoService: UserInfoService) {
		this.userInfoService.getUserInfo().subscribe((u) => {
			console.log(u);
			this.process(this.app || Portal);
		});
	}

	canActivate(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot

	): Observable<boolean> | boolean {

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
			this.userInfoService.userInfo$.pipe(tap((userInfo) => {
				console.log(userInfo);
				if (!!userInfo) {

					const allowed = this.userInfoService.getUserAccess(app.access);
					if (!allowed) {
						// user does not have access to app
						if (userInfo.isCommercialLineRole && !(userInfo.isInOpsAdminRole || userInfo.isInSupportAdminRole)) {
							this.router.navigateByUrl("/CommercialLines/Apps/PolicySearch");
						}
						// opt user only -- Personal Lines
						else if (userInfo.isInOpsUserRole && !(userInfo.isInOpsAdminRole || userInfo.isInSupportAdminRole)) {
							this.router.navigateByUrl("/CustomerService/Apps/Snapshot");
						}
						// too many options to direct user to good starting point
						else {
							this.router.navigateByUrl("/Portal");
						}
					}
					// user have
					else {
						return allowed;
					}
				}
			}));
		}
		else {
			const prefix = ConfigurationSettings.appSettings.environment.prefix;
			const envUrl = ConfigurationSettings.appSettings.environment.isProduction ? app.externalInfo.url : app.externalInfo.url.replace("//", "//" + prefix + "-");
			window.open(envUrl, "_blank");
			return false;
		}
	}
}
