import { Injectable, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { Observable, BehaviorSubject } from "rxjs";
import { filter, map, startWith } from "rxjs/operators";
import { PageTitleService } from "../infrastructure/page-title/page-title.service";
import { UserInfoService } from "../user-info/user-info.service";
import { ApplicationGroupMetadata, ApplicationMetadata } from "../../data/application/application.interface";
import { NavRailLinkItem } from "../../components/layout/nav-rail/nav-rail-link-item";
import { ConfigurationSettings } from "../configuration/config-info";
import { applicationGroups } from "../../data/application/applications-metadata";

@Injectable({ providedIn: "root" })
export class AppDataService {

	private currentAppGroup: ApplicationGroupMetadata = null;
	private currentAppGroupSubject: BehaviorSubject<ApplicationGroupMetadata> =
		new BehaviorSubject<ApplicationGroupMetadata>(this.currentAppGroup);

	public currentAppGroup$: Observable<ApplicationGroupMetadata> = this.currentAppGroupSubject.asObservable();

	private document = inject(DOCUMENT, { optional: true });
	private router = inject(Router);
	public pageTitleService = inject(PageTitleService);
	public userInfoService = inject(UserInfoService);

	constructor() {

		this.userInfoService.userInfo$.subscribe(() => {
			this.router.events
				.pipe(
					filter(event => event instanceof NavigationEnd),
					startWith(this.router),
					map(() => {
						const routeParts = this.router.url.split("/");
						const route = routeParts[1] ?? routeParts[0];
						return this.getEnabledApplicationGroups().find(x => x.id === route);
					})
				)
				.subscribe((app: ApplicationGroupMetadata) => {
					if (app && this.userInfoService.getUserAccess(app.access)) {
						app.applications = app.applications?.filter(x => {
							return this.shouldDisplayApplication(x) &&
								this.userInfoService.getUserAccess(app.access);
						});
						this.currentAppGroupSubject.next(app);
						this.pageTitleService.title = app.name;
					}
				});
		});
	}

	getAllApplicationGroups = () => applicationGroups;

	getEnabledApplicationGroups = () =>
		this.getAllApplicationGroups()
			.filter(x => this.shouldDisplayApplication(x));

	shouldDisplayApplication(metadata: ApplicationGroupMetadata | ApplicationMetadata | NavRailLinkItem): boolean {
		const isProd = ConfigurationSettings.appSettings.environment.isProduction;
		const isReady = metadata.isReady;
		const isNonProdOnly = metadata.isNonProdOnly ?? false;

		if (isProd && isNonProdOnly) {
			return false;
		}
		else {
			return isReady;
		}
	}
}
