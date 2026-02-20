import { DialogService, EnumService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { MatDialogRef } from "@angular/material/dialog";
import { ClParticipantHistoryComponent } from "./commercial-participant-history.component";
import { CommercialParticipantService } from "../../services/participant.service";

function setup() {
	const enums = autoSpy(EnumService);
	const dialog = autoSpy(MatDialogRef<ClParticipantHistoryComponent>);
	const dialogService = autoSpy(DialogService);
	const participantService = autoSpy(CommercialParticipantService);

	const injectedData = {};
	const builder = {
		enums,
		dialogService,
		policyHistoryService: participantService,
		default() {
			return builder;
		},
		build() {
			return new ClParticipantHistoryComponent(injectedData, dialog, enums, dialogService, participantService);
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
