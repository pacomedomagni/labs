import { Component, computed, input, inject } from "@angular/core";

import { CoreUiModule, ThemePickerModule } from "@pgr-cla/core-ui-components";
import { NavRailLinkItem } from "./nav-rail-link-item";
import { MatIconModule } from "@angular/material/icon";

import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AppDataService } from "../../../services/infrastructure/app-data-service/app-data.service";
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
	
	private appDataService = inject(AppDataService);


	shouldDisplay(link: NavRailLinkItem): boolean {
		return this.appDataService.shouldDisplayApplication(link);
	}

}
