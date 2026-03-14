import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { NotificationBannerService } from "../shared/notifications/notification-banner/notification-banner.service";
import { UserInfo } from "../shared/data/application/resources";
import { UserInfoService } from "../shared/services/user-info/user-info.service";

@Component({
	selector: "tmx-role-testing",
	templateUrl: "./role-testing.component.html",
	styleUrls: ["./role-testing.component.scss"],
	standalone: true,
	imports: [
		FormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,
		MatButtonModule
	]
})
export class RoleTestingComponent implements OnInit {

	userInfo: UserInfo;
	properties: string[];

	constructor(private userInfoService: UserInfoService, private notification: NotificationBannerService) { }

		       ngOnInit(): void {
			       const loaded = sessionStorage.getItem('tmx-role-testing-loaded');
			       if (!loaded) {
				       this.reset();
				       sessionStorage.setItem('tmx-role-testing-loaded', 'true');
			       } else {
				       const userInfo = this.userInfoService.userInfo.value;
				       if (userInfo && userInfo.lanId) {
					       this.userInfo = { ...this.defaultUserModel(), ...userInfo };
					       this.properties = Object.keys(this.userInfo).filter(x => x !== "name" && x !== "lanId");
				       } else {
					       this.reset();
				       }
			       }
		       }

	onRoleChange(access: string, checked: boolean): void {
		this.userInfo[access] = checked;
		if (access === 'isLabsAdmin' && checked) {
			this.userInfo.isLabsUser = true;
		}
	}

	isRoleDisabled(access: string): boolean {
		return access === 'isLabsUser' && this.userInfo.isLabsAdmin;
	}

	submit(): void {
		this.userInfoService.userInfo.next(this.userInfo);
		this.notification.success("User info updated");
	}

			       reset(): void {
				       this.userInfoService.getUserInfo().subscribe(ui => {
					       this.userInfoService.userInfo.next(ui);
					       this.userInfo = { ...this.defaultUserModel(), ...ui };
					       this.properties = Object.keys(this.userInfo).filter(x => x !== "name" && x !== "lanId");
					       sessionStorage.setItem('tmx-role-testing-loaded', 'true');
				       });
			       }

	private defaultUserModel(): UserInfo {
		return {
			lanId: "",
			name: "",
			isLabsAdmin: false,
			isLabsUser: false
		};
	}
}
