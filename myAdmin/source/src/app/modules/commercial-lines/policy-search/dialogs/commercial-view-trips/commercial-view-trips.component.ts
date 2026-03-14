import { Component, Inject, Optional } from "@angular/core";

import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DialogService } from "@modules/shared/services/_index";
import { CommercialParticipantService } from "../../services/participant.service";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";

@Component({
    selector: "tmx-commercial-view-trips",
    templateUrl: "./commercial-view-trips.component.html",
    styleUrls: ["./commercial-view-trips.component.scss"],
    standalone: false
})
export class ClViewTripsComponent {
	optIn = false;
	heavyTruck = true;
	cableType = "6-Pin";

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private dialogService: DialogService,
		private participantService: CommercialParticipantService,
		private query: CommercialPolicyQuery) { }

}
