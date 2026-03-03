import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { NotificationBannerService } from "../../shared/notifications/notification-banner/notification-banner.service";
import { UserInfo } from "../../shared/data/application/resources";
import { UserInfoService } from "../../shared/services/user-info/user-info.service";
import { pipe } from "rxjs";

@Component({
	selector: "tmx-user-info-editor",
	templateUrl: "./user-info-editor.component.html",
	styleUrls: ["./user-info-editor.component.scss"],
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
export class UserInfoEditorComponent implements OnInit {

	userInfo: UserInfo;
	properties: string[];

	constructor(private userInfoService: UserInfoService, private notification: NotificationBannerService) { }

	ngOnInit(): void {
		this.reset();
		this.properties = ["isLabsAdmin", "isLabsUser"];
	}

	submit(): void {
		this.userInfoService.userInfo.next(this.userInfo);
		this.notification.success("User info updated");
	}

	reset(): void {
		this.userInfoService.getUserInfo().subscribe(pipe(ui => {
			this.userInfoService.userInfo.next(ui);
		}));
		this.userInfo = { ...this.defaultUserModel(), ...this.userInfoService.userInfo.value };
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
