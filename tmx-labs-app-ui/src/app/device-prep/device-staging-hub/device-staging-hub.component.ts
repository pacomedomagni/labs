import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { AppDataService } from "../../shared/services/app-data-service/app-data.service";
import { UserInfoService } from "../../shared/services/user-info/user-info.service";
import { applicationGroups } from "./device-staging-hub-metadata";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ApplicationGroupMetadata } from "../../shared/data/application/application.interface";

@Component({
  selector: "tmx-device-staging-hub",
  standalone: true,
  imports: [RouterModule, MatIconModule, FaIconComponent],
  templateUrl: "./device-staging-hub.component.html",
  styleUrl: "./device-staging-hub.component.scss"
})
export class DeviceStagingHubComponent {
  private appDataService = inject(AppDataService);
  private userInfoService = inject(UserInfoService);

  apps = applicationGroups;

    shouldDisplay(app: ApplicationGroupMetadata): boolean {
        return this.appDataService.shouldDisplayApplication(app) &&
          this.userInfoService.getUserAccess(app.access);
      }
}
