import { Component, Input, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { AppDataService } from "@modules/shared/services/app-data-service/app-data.service";
import { SideSheetService } from "@pgr-cla/core-ui-components";
import { NavRailLinkItem } from "./nav-rail-link-item";

@UntilDestroy()
@Component({
    selector: "tmx-nav-rail",
    templateUrl: "./nav-rail.component.html",
    styleUrls: ["./nav-rail.component.scss"],
    standalone: false
})
export class NavRailComponent implements OnInit {

	@Input() navLinks: NavRailLinkItem[];
	@Input() sideNavId = "sideNav";

	private subAppCount = 0;

	constructor(
		private appDataService: AppDataService,
		private sideSheetService: SideSheetService) { }

	ngOnInit(): void {
		this.appDataService.currentAppGroup$.pipe(untilDestroyed(this)).subscribe(x => this.subAppCount = x?.applications.length);
	}

	showMenu(): boolean {
		let show = false;
		if (this.subAppCount > 1) {
			show = true;
		}
		return show;
	}

	toggleSideNav(): void {
		const sideNav = this.sideSheetService.get(this.sideNavId);
		if (sideNav && this.subAppCount > 1) {
			sideNav.toggle();
		}
	}

	shouldDisplay(link: NavRailLinkItem): boolean {
		return this.appDataService.shouldDisplayApplication(link);
	}

}
