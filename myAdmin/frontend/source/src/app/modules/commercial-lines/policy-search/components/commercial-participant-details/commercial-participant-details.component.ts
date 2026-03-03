import { Component, Input, OnInit } from "@angular/core";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";
import { Registration, CommercialParticipantJunction, CommercialPolicy } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { CommercialDeviceLocationDescription, CommercialDeviceStatusDescription, CommercialReturnReasonDescription } from "../../data/models";

@UntilDestroy()
@Component({
    selector: "tmx-commercial-participant-details",
    templateUrl: "./commercial-participant-details.component.html",
    styleUrls: ["./commercial-participant-details.component.scss"],
    standalone: false
})
export class CLParticipantDetailsComponent implements OnInit {

	@Input() label: string;

	participants: CommercialParticipantJunction[];
	policy: CommercialPolicy;

	registration: Registration;
	formats = UIFormats;
	participantTracker: any;

	commercialDeviceStatusDescription = CommercialDeviceStatusDescription;
	commercialReturnReasonDescription = CommercialReturnReasonDescription;
	commercialDeviceLocationDescription = CommercialDeviceLocationDescription;

	constructor(
		public enums: EnumService,
		public commercialPolicyQuery: CommercialPolicyQuery) { }

	ngOnInit(): void {
		this.commercialPolicyQuery.commercialParticipant$.pipe(untilDestroyed(this))
			.subscribe(p => {
				this.participants = Array.isArray(p) ? p : [];
			});
		this.commercialPolicyQuery.commercialPolicy$.pipe(untilDestroyed(this))
			.subscribe(p => {
				this.policy = p && typeof p === "object" && "policySeqId" in p ? p as CommercialPolicy : null;
			});
	}

}
