import { ApplicationGroupIds, ApplicationGroupMetadata, applicationGroups } from "@modules/shared/data/_index";

import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AppDataService } from "@modules/shared/services/app-data-service/app-data.service";
import { UserInfoService } from "../../../shared/services/user-info/user-info.service";

@Component({
    selector: "tmx-portal-container",
    templateUrl: "./container.component.html",
    styleUrls: ["./container.component.scss"],
    standalone: false
})
export class PortalContainerComponent {

	apps = applicationGroups;

	constructor(private router: Router,
		private appDataService: AppDataService,
		private userInfoService: UserInfoService) { }

	shouldDisplay(app: ApplicationGroupMetadata): boolean {
		return app.id !== ApplicationGroupIds.Portal &&
			this.appDataService.shouldDisplayApplication(app) &&
			this.userInfoService.getUserAccess(app.access);
	}

}
