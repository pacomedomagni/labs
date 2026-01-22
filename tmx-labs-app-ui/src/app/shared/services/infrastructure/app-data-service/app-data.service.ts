import { Injectable, inject, signal, Signal, WritableSignal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ApplicationGroupMetadata, ApplicationMetadata } from "../../../data/application/application.interface";
import { PageTitleService } from "../page-title/page-title.service";
import { UserInfoService } from "../../user-info/user-info.service";
import { ConfigurationSettings } from "../../configuration/config-info";
import { NavRailLinkItem } from "../../../components/layout/nav-rail/nav-rail-link-item";
import { applicationGroups } from "../../../data/application/applications-metadata";

@UntilDestroy()
@Injectable({ providedIn: "root" })
export class AppDataService {

	private _currentAppGroup: WritableSignal<ApplicationGroupMetadata | null> = signal(null);

	public get currentAppGroup(): Signal<ApplicationGroupMetadata | null> {
		return this._currentAppGroup.asReadonly();
	}

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
					}),
					untilDestroyed(this)
				)
				.subscribe((app: ApplicationGroupMetadata) => {
					if (app && this.userInfoService.getUserAccess(app.access)) {
						app.applications = app.applications?.filter(x => {
							return this.shouldDisplayApplication(x) &&
								this.userInfoService.getUserAccess(app.access);
						});
						this._currentAppGroup.set(app);
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
