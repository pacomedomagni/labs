import { ApplicationGroupMetadata, ApplicationMetadata } from "@modules/shared/data/_index";
import { Component, OnInit } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";

import { AppDataService } from "@modules/shared/services/app-data-service/app-data.service";
import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { UserInfoService } from "@modules/shared/services/_index";

@UntilDestroy()
@Component({
    selector: "tmx-side-nav-bar",
    templateUrl: "./side-nav-bar.component.html",
    styleUrls: ["./side-nav-bar.component.scss"],
    standalone: false
})
export class SideNavBarComponent implements OnInit {

	appGroup: ApplicationGroupMetadata;
	groupedApps: [{ appType: string; apps: ApplicationMetadata[] }];

	constructor(
		private userInfoService: UserInfoService,
		public appDataService: AppDataService
	) { }

	ngOnInit(): void {
		this.appDataService.currentAppGroup$.subscribe(x => {
			this.appGroup = x;
			this.groupedApps = undefined;

			if (this.appGroup) {
				/* tslint:disable:forin */
				for (const id in ApplicationTypeIds) {
					const typeId = ApplicationTypeIds[id as keyof typeof ApplicationTypeIds];

					const filteredApps = this.appGroup.applications.filter(
						y => y.typeId === typeId &&
							this.userInfoService.getUserAccess(y.access)
					);
					if (filteredApps.length > 0) {
						const app = { appType: typeId, apps: filteredApps };
						if (this.groupedApps === undefined) {
							this.groupedApps = [app];
						}
						else {
							this.groupedApps.push(app);
						}
					}
				}
			}
			/* tslint:enable:forin */
		});
	}

	shouldDisplay(app: ApplicationMetadata): boolean {
		return this.appDataService.shouldDisplayApplication(app);
	}
}
