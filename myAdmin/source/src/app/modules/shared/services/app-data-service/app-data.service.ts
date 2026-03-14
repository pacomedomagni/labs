import { Injectable, Inject, Optional, DOCUMENT } from "@angular/core";

import { ApplicationGroupMetadata, applicationGroups, ApplicationMetadata } from "@modules/shared/data/_index";
import { Router, NavigationEnd } from "@angular/router";
import { Observable, BehaviorSubject } from "rxjs";
import { filter, map, startWith } from "rxjs/operators";
import { PageTitleService } from "@modules/core/services/_index";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NavRailLinkItem } from "@modules/shared/components/nav-rail/nav-rail-link-item";
import { ConfigurationSettings } from "@modules/core/services/configuration/config-info";
import { UserInfoService } from "../user-info/user-info.service";

@UntilDestroy()
@Injectable({ providedIn: "root" })
export class AppDataService {

	private currentAppGroup: ApplicationGroupMetadata = null;
	private currentAppGroupSubject: BehaviorSubject<ApplicationGroupMetadata> =
		new BehaviorSubject<ApplicationGroupMetadata>(this.currentAppGroup);

	public currentAppGroup$: Observable<ApplicationGroupMetadata> = this.currentAppGroupSubject.asObservable();

	constructor(
		@Optional() @Inject(DOCUMENT) private document: Document,
		private router: Router,
		public pageTitleService: PageTitleService,
		public userInfoService: UserInfoService) {

		this.userInfoService.userInfo$.subscribe(() => {
			this.router.events
				.pipe(
					filter(event => event instanceof NavigationEnd),
					startWith(this.router),
					map(() => {
						const routeParts = this.router.url.split("/");
						const route = routeParts[1] ?? routeParts[0];
						return this.getEnabledApplicationGroups().find(x => x.id === route);
					}),
					untilDestroyed(this)
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
		const hasExternalInfo = metadata.externalInfo !== undefined;

		if (isProd && isNonProdOnly) {
			return false;
		}
		else {
			return isReady || hasExternalInfo;
		}
	}
}
