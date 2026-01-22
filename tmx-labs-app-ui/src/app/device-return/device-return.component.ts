import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { AppDataService } from "../shared/services/app-data-service/app-data.service";
import { UserInfoService } from "../shared/services/user-info/user-info.service";
import { ApplicationGroupMetadata } from "../shared/data/application/application.interface";
import { ApplicationGroupIds } from "../shared/data/application/application-groups.model";
import { applicationGroups } from "./device-return-applications-metadata";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: "tmx-device-return",
  standalone: true,
  imports: [RouterModule, MatIconModule,FaIconComponent],
  templateUrl: "./device-return.component.html",
  styleUrls: ["./device-return.component.scss"]
})
export class DeviceReturnComponent {
  private appDataService = inject(AppDataService);
  private userInfoService = inject(UserInfoService);

  apps = applicationGroups;

  shouldDisplay(app: ApplicationGroupMetadata): boolean {
      return app.id !== ApplicationGroupIds.DeviceReturn &&
        this.appDataService.shouldDisplayApplication(app) &&
        this.userInfoService.getUserAccess(app.access);
    }
}
