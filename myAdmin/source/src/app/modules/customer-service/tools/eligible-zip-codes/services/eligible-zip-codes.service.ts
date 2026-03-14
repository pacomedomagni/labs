import { ApiService } from "@modules/core/services/api/api.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { EligibleZipCode } from "@modules/shared/data/resources";

@Injectable({ providedIn: "root" })
export class EligibleZipCodesService {

	private readonly controller = "/tools/eligibility";

	constructor(private api: ApiService) { }

	getEligibleZipCodes(state?: string, zipCode?: string): Observable<EligibleZipCode[]> {
		let queryParms = "";
		if (state) {
			queryParms += `state=${state}`;
		}
		if (zipCode) {
			if (queryParms !== "") {
				queryParms += "&";
			}
			queryParms += `zipCode=${zipCode}`;
		}
		return this.api.get<EligibleZipCode[]>({ uri: `${this.controller}/eligibleZipCodes?${queryParms}` });
	}
}
