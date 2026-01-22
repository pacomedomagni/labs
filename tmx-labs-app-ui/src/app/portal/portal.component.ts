import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppDataService } from '../shared/services/app-data-service/app-data.service';
import { UserInfoService } from '../shared/services/user-info/user-info.service';
import { applicationGroups } from '../shared/data/application/applications-metadata';
import { ApplicationGroupMetadata } from '../shared/data/application/application.interface';
import { ApplicationGroupIds } from '../shared/data/application/application-groups.model';
import { MatIconModule } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'tmx-portal',
  imports: [MatIconModule, RouterModule, FaIconComponent],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.scss'
})

export class PortalContainerComponent {
	private appDataService = inject(AppDataService);
	private userInfoService = inject(UserInfoService);

	apps = applicationGroups;

	shouldDisplay(app: ApplicationGroupMetadata): boolean {
		return app.id !== ApplicationGroupIds.Portal &&
			this.appDataService.shouldDisplayApplication(app) &&
			this.userInfoService.getUserAccess(app.access);
	}

}