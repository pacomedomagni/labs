import { UserInfo } from "@modules/shared/data/resources";
import { UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { MatDialog } from "@angular/material/dialog";
import { CommercialPolicyQuery } from "../../stores/_index";
import { CommercialPolicyService } from "../../services/_index";
import { CLParticipantActionsComponent } from "./commercial-participant-actions.component";
import { CommercialParticipantService } from "../../services/participant.service";

function setup() {
	const appHelper = autoSpy(ResourceQuery);
	const query = autoSpy(CommercialPolicyQuery);
	const policyService = autoSpy(CommercialPolicyService);
	const dialogService = autoSpy(DialogService);
	const userInfoService = autoSpy(UserInfoService);
	const participantService = autoSpy(CommercialParticipantService);
	const dialog = autoSpy(MatDialog);
	(userInfoService as any).userInfo = {} as UserInfo;

	const builder = {
		appHelper,
		query,
		policyService,
		dialogService,
		userInfoService,
		participantService,
		default() {
			return builder;
		},
		build() {
			return new CLParticipantActionsComponent(appHelper, dialog, query,
				policyService, userInfoService, dialogService, participantService);
		}
	};

	return builder;
}

describe("ParticipantActionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
