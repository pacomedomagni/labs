import { Component, computed, input, inject } from "@angular/core";

import { CoreUiModule, ThemePickerModule } from "@pgr-cla/core-ui-components";
import { NavRailLinkItem } from "./nav-rail-link-item";
import { MatIconModule } from "@angular/material/icon";

import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AppDataService } from "../../../services/infrastructure/app-data-service/app-data.service";
import { SecondarySidebarService } from '../../../services/secondary-sidebar/secondary-sidebar.service';
import { ApplicationGroupIds } from '../../../data/application/application-groups.model';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
	selector: "tmx-nav-rail",
	templateUrl: "./nav-rail.component.html",
	styleUrls: ["./nav-rail.component.scss"],
	standalone: true,
	imports: [RouterModule, MatIconModule, MatButtonModule, CoreUiModule, ThemePickerModule, FaIconComponent]
})
export class NavRailComponent {

	navLinks = input<NavRailLinkItem[]>([]);
	linksLoading = computed(() => this.navLinks().length === 0);
	
	appDataService = inject(AppDataService);
	secondarySidebarService = inject(SecondarySidebarService);
	ApplicationGroupIds = ApplicationGroupIds;

	showMenu(): boolean {
		const appGroup = this.appDataService.currentAppGroup();
		return !!(appGroup && appGroup.applications && appGroup.applications.length > 1);
	}

	toggleSideNav(): void {
		this.secondarySidebarService.toggle();
	}


	shouldDisplay(link: NavRailLinkItem): boolean {
		return this.appDataService.shouldDisplayApplication(link);
	}

}
