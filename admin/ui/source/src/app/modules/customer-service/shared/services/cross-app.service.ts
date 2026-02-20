import { Injectable } from "@angular/core";
import { ApiService } from "@modules/core/services/_index";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { PolicyEnrolledFeatures } from "@modules/shared/data/resources";
import { EnumService } from "@modules/shared/services/_index";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { TelematicsFeaturesMenuData } from "../data/models";
import { CrossAppQuery } from "../stores/cross-app-query";

@Injectable()
export class CrossAppService {

	private readonly controller = "/CustomerService/CrossApp";
	private routerLinkBase = "/CustomerService/Apps";

	constructor(private api: ApiService, private query: CrossAppQuery, private enumService: EnumService) { }

	getPolicyEnrolledFeatures(policyNumber: string): Observable<PolicyEnrolledFeatures> {
		return this.api.get<PolicyEnrolledFeatures>({ uri: `${this.controller}/enrolledFeatures/${policyNumber}` })
			.pipe(tap(data => this.query.updatePolicyEnrolledFeatures(data)));
	}

	getAvailableFeaturesMenuData(currentFeature: TelematicsFeatures, policyEnrolledFeatures: PolicyEnrolledFeatures): TelematicsFeaturesMenuData[] {
		const availableFeatures = [];

		if (policyEnrolledFeatures?.isEnrolledInAre) {
			const shouldDisable = currentFeature === TelematicsFeatures.AccidentDetection;
			availableFeatures.push({
				routerLink: `${this.routerLinkBase}/${TelematicsFeatures.AccidentDetection}`,
				isDisabled: shouldDisable,
				display: this.getFeatureMenuDisplay(this.enumService.telematicsFeatures.description(TelematicsFeatures.AccidentDetection), shouldDisable)
			});
		}

		if (policyEnrolledFeatures?.isEnrolledInSnapshot) {
			const shouldDisable = currentFeature === TelematicsFeatures.Snapshot;
			availableFeatures.push({
				routerLink: `${this.routerLinkBase}/${TelematicsFeatures.Snapshot}`,
				isDisabled: shouldDisable,
				display: this.getFeatureMenuDisplay(this.enumService.telematicsFeatures.description(TelematicsFeatures.Snapshot), shouldDisable)
			});
		}

		return availableFeatures;
	}

	private getFeatureMenuDisplay(feature: string, isDisabled: boolean): string {
		return feature + (isDisabled ? " (Current)" : "");
	}
}
