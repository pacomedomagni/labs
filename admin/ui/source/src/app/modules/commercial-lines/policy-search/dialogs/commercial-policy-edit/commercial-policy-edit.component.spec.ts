import { DialogService, EnumService } from "@modules/shared/services/_index";
import { MatDialogRef } from "@angular/material/dialog";
import { autoSpy } from "autoSpy";
import { CommercialPolicyEditComponent } from "./commercial-policy-edit.component";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { CommercialPolicyService } from "../../services/comm-policy.service";

function setup() {
	const enums = autoSpy(EnumService);
	const dialog = autoSpy(MatDialogRef<CommercialPolicyEditComponent>);
	const dialogService = autoSpy(DialogService);
	const participantService = autoSpy(CommercialPolicyService);
	const query = autoSpy(CommercialPolicyQuery);

	const injectedData = {};
	const builder = {
		enums,
		dialogService,
		policyHistoryService: participantService,
		default() {
			return builder;
		},
		build() {
			return new CommercialPolicyEditComponent(injectedData, dialog, dialogService, participantService, query);
		}
	};

	return builder;
}

describe("CommercialPolicyEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
