import { Component, OnInit } from "@angular/core";

import { NotificationService } from "@pgr-cla/core-ui-components";
import { UserInfo } from "@modules/shared/data/resources";
import { UserInfoService } from "@modules/shared/services/_index";
import { pipe } from "rxjs";

@Component({
    selector: "tmx-user-info-editor",
    templateUrl: "./user-info-editor.component.html",
    styleUrls: ["./user-info-editor.component.scss"],
    standalone: false
})
export class UserInfoEditorComponent implements OnInit {

	userInfo: UserInfo;
	properties: string[];

	constructor(private userInfoService: UserInfoService, private notification: NotificationService) { }

	ngOnInit(): void {
		this.reset();
		this.properties = Object.keys(this.userInfo).filter(x => x !== "name" && x !== "lanId");
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
			isInOpsAdminRole: false,
			isInOpsUserRole: false,
			isInSupportAdminRole: false,
			isCommercialLineRole: false,
			hasEligibilityAccess: false,
			hasInsertInitialParticipationScoreInProcessAccess: false,
			hasOptOutSuspensionAccess: false,
			hasPolicyMergeAccess: false,
			hasResetEnrollmentAccess: false,
			hasStopShipmentAccess: false,
			hasUpdatePProGuidAccess: false,
			hasVehicleSupportAccess: false,
			isInMobileRegistrationAdminRole: false,
			isInTheftOnlyRole: false,
			isInTheftRole: false,
			isInFeeReversalOnlyRole: false,
			isInFeeReversalRole: false,
			isInAppChangeRole: false,
			isInMobileRegSearchPilot: false,
			lanId: "",
			name: ""
		};
	}
}
