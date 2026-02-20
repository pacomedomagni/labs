import { Component, OnInit } from "@angular/core";
import { AreExperience } from "@modules/shared/data/enums";
import { Policy } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ArePolicyQuery } from "../../stores/_index";

@UntilDestroy()
@Component({
    selector: "tmx-are-policy-details",
    templateUrl: "./policy-details.component.html",
    styleUrls: ["./policy-details.component.scss"],
    standalone: false
})
export class PolicyDetailsComponent implements OnInit {

	policy: Policy;
	areExperience: AreExperience;

	constructor(private query: ArePolicyQuery, private helper: ResourceQuery) { }

	ngOnInit(): void {
		this.query.policy$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.policy = x;
			}
		});
	}
}
