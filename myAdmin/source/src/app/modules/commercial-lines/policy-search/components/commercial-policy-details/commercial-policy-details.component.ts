import { Component } from "@angular/core";
import { CommercialPolicy } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";

@UntilDestroy()
@Component({
    selector: "tmx-commercial-policy-details",
    templateUrl: "./commercial-policy-details.component.html",
    styleUrls: ["./commercial-policy-details.component.scss"],
    standalone: false
})
export class CLPolicyDetailsComponent {

	policy: CommercialPolicy;

	constructor(private query: CommercialPolicyQuery, private helper: ResourceQuery) {

		this.query.commercialPolicy$.pipe(untilDestroyed(this)).subscribe(x => {
			this.policy = x;
		});
	}

}
