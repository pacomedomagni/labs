import { ApplicationGroupIds, applicationGroups } from "@modules/shared/data/_index";
import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AuthService } from "@modules/auth/services/auth.service";
import { ConfigurationSettings } from "@modules/core/services/configuration/config-info";
import { NavRailLinkItem } from "@modules/shared/components/nav-rail/nav-rail-link-item";
import { UserInfoService } from "@modules/shared/services/user-info/user-info.service";
import { filter } from "rxjs/operators";

@UntilDestroy()
@Component({
    selector: "tmx-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})

export class AppComponent implements OnInit {
	apps = applicationGroups.map(x =>
	({
		id: x.id,
		route: "./" + x.id,
		routeGuard: x.routeGuard,
		label: x.name,
		icon: x.icon,
		svgIcon: x.svgIcon,
		isReady: x.isReady,
		isNonProdOnly: x.isNonProdOnly ?? false,
		externalInfo: x.externalInfo,
		access: x.access
	} as NavRailLinkItem));

	links: NavRailLinkItem[];
	constructor(private router: Router,
		private auth: AuthService,
		private userService: UserInfoService
	) {
		this.auth.configure(ConfigurationSettings.appSettings.auth);
		this.auth.isAuthenticated$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.userService.getUserInfo().subscribe(userRoles => {
					console.log("🚀 ~ User Info ~ ", userRoles);
					this.links = this.apps
						.filter(app => { return this.userService.getUserAccess(app.access); })
						.sort((app, sort) => app.id === ApplicationGroupIds.Portal ? -1 : sort.id === ApplicationGroupIds.Portal ? 1 : 0);
				}
				);
			}
		});
		this.router.events
			.pipe(
				filter(e => !(e instanceof NavigationEnd)),
				untilDestroyed(this))
			.subscribe((() => {
				window.scrollTo(0, 0);
			}));
	}

	ngOnInit(): void {
		this.auth.isAuthenticated$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.userService.userInfo$.subscribe(userRoles => {
					this.links = this.apps
						.filter(app => { return this.userService.getUserAccess(app.access); })
						.sort((app, sort) => app.id === ApplicationGroupIds.Portal ? -1 : sort.id === ApplicationGroupIds.Portal ? 1 : 0);
				}
				);
			}
		});
		this.router.events
			.pipe(
				filter(e => !(e instanceof NavigationEnd)),
				untilDestroyed(this))
			.subscribe((() => {
				window.scrollTo(0, 0);
			}));
	}
}
