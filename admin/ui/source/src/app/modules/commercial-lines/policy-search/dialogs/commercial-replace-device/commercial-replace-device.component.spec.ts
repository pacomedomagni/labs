import { DialogService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { MatDialogRef } from "@angular/material/dialog";
import { CommercialParticipantService } from "../../services/participant.service";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { ClReplaceDeviceComponent } from "./commercial-replace-device.component";

function setup() {
	const injectedData = {};
	const diagService = autoSpy(DialogService);
	const partService = autoSpy(CommercialParticipantService);
	const query = autoSpy(CommercialPolicyQuery);
	const matRef = autoSpy(MatDialogRef<ClReplaceDeviceComponent>);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ClReplaceDeviceComponent(injectedData, matRef, diagService, partService, query);
		}
	};

	return builder;
}

describe("ExcludeDateRangeComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();
		expect(component).toBeTruthy();
	});
});
