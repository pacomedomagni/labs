import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { NavRailLinkItem } from './shared/components/layout/nav-rail/nav-rail-link-item';
import { NavRailComponent } from './shared/components/layout/nav-rail/nav-rail.component';
import { ConfigurationSettings } from './shared/services/configuration/config-info';
import { AuthService } from './shared/services/auth/auth.service';
import { UserInfoService } from './shared/services/user-info/user-info.service';
import { applicationGroups } from './shared/data/application/applications-metadata';
import { ApplicationGroupIds } from './shared/data/application/application-groups.model';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'tmx-root',
  imports: [RouterOutlet, MatButtonModule, SpinnerComponent, NavRailComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

@UntilDestroy()
export class App {
  private auth = inject(AuthService);
  private userService = inject(UserInfoService);
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  	apps = applicationGroups.map(x =>
	({
		id: x.id,
		route: "./" + x.id,
		routeGuard: x.routeGuard,
		label: x.name,
		icon: x.icon,
		svgIcon: x.svgIcon,
    faIcon: x.faIcon,
		isReady: x.isReady,
		isNonProdOnly: x.isNonProdOnly ?? false,
		access: x.access
	} as NavRailLinkItem));

	links: WritableSignal<NavRailLinkItem[]> = signal([]);

  constructor(){
    this.auth.configure(ConfigurationSettings.appSettings.auth);
    this.auth.isAuthenticated$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.userService.getUserInfo().subscribe(userRoles => {
          console.log("🚀 ~ User Info ~ ", userRoles);
          this.links.set(this.apps
            .filter(app => { return this.userService.getUserAccess(app.access); })
            .sort((app, sort) => app.id === ApplicationGroupIds.Portal ? -1 : sort.id === ApplicationGroupIds.Portal ? 1 : 0));
        });
      }
    });

		const icons = [
			["ubi_progressive_p", "logo-p.svg"],
			["ubi_progressive_logo", "logo-progressive.svg"],
			["ubi_sadcone", "sadCone.svg"],
			["ubi_snapshot_mobile", "snapshot_phoneuse.svg"],
			["ubi_snapshot_device", "snapshot_plugin.svg"],
			["ubi_snapshot_trip", "snapshot_total_trips.svg"],
			["ubi_home", "home.svg"],
			["ubi_search", "search.svg"],
			["tel_mobile", "tel_mobile.svg"],
			["tel_plugin", "tel_plugin.svg"],
      ["pgr_medical_payments", "pgr_medical_payments.svg"],
      ["pgr_snapshot_device", "pgr_snapshot_plugin.svg"],
		];
		icons.forEach(x => this.addMatIcon(x[0], x[1]));
	

}
  addMatIcon(iconName: string, fileName: string): void {
    this.matIconRegistry.addSvgIcon(
      iconName,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${fileName}`)
    );
  }
}

  