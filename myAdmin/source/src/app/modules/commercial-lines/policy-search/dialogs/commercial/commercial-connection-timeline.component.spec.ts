import { DialogService, EnumService } from "@modules/shared/services/_index";
import { MatDialogRef } from "@angular/material/dialog";
import { autoSpy } from "autoSpy";
import { ClConnectionTimelineComponent } from "./commercial-connection-timeline.component";
import { CommercialParticipantService } from "../../services/participant.service";
import { CommercialPolicyService } from "../../services/comm-policy.service";

const injectedData = {};
function setup() {
	const enums = autoSpy(EnumService);
	const dialog = autoSpy(MatDialogRef<ClConnectionTimelineComponent>);
	const dialogService = autoSpy(DialogService);
	const participantService = autoSpy(CommercialParticipantService);
	const commercialPolicyService = autoSpy(CommercialPolicyService);

	const builder = {
		enums,
		dialogService,
		policyHistoryService: participantService,
		commercialPolicyService,
		default() {
			return builder;
		},
		build() {
			return new ClConnectionTimelineComponent(injectedData, dialog, enums, dialogService, participantService, commercialPolicyService);
		}
	};

	return builder;
}

describe("ParticipantJunctionDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
