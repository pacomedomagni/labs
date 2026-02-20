import { Injectable } from "@angular/core";
import { HelperService } from "@modules/shared/services/_index";
import { PolicyQuery } from "@modules/customer-service/shared/stores/_index";
import { Policy } from "@modules/shared/data/resources";

@Injectable()
export class SnapshotPolicyQuery extends PolicyQuery {

	constructor(helper: HelperService) {
		super(helper);
	}

	updatePolicy(policy: Policy): void {
		if (policy !== undefined) {
			policy.participants = policy.participants?.filter(x => x.snapshotDetails);
		}
		super.updatePolicy(policy);
	}
}
