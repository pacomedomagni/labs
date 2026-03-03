import { Injectable } from "@angular/core";
import { ApiService } from "@modules/core/services/_index";
import { PolicyService, RegistrationService } from "@modules/customer-service/shared/services/_index";
import { HomebaseParticipantSummaryResponse, Policy } from "@modules/shared/data/resources";
import { Observable, OperatorFunction } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import { ArePolicyQuery } from "../stores/_index";

@Injectable()
export class ArePolicyService extends PolicyService {

	protected readonly controller = "/CustomerService/Policy";

	constructor(
		protected api: ApiService,
		protected registration: RegistrationService,
		protected policyQuery: ArePolicyQuery) {
		super(api, registration, policyQuery);
	}

	getPolicy(policyNumber: string): Observable<Policy> {

		return this.api.get<Policy>({
			uri: `${this.controller}/Search/ByPolicy/${policyNumber}`
		}).pipe(
			tap(data => {
				if (!this.isArePolicy(data)) {
					this.setDataToNotFound(data);
				} else {
					this.query.updatePolicy(data);
					this.query.updateMultiPolicy(undefined);
					this.query.updatePolicyRegistrations(data.participants?.map(x => x.registrationDetails));
					data.participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
					this.getHomebaseParticipantsSummaries(policyNumber,data).subscribe();
				}
			})
		);
	}

	getPolicyByRegistrationCode(registrationCode: string): Observable<Policy[]> {
		return this.api.get<Policy[]>({ uri: `${this.controller}/Search/ByRegistration/${registrationCode}` })
			.pipe(tap(data => {
				if (data.length === 1) {
					const policy = data[0];

					if (!this.isArePolicy(policy)) {
						this.setDataToNotFound(policy);
					} else {
						this.query.updatePolicy(policy);
						this.query.updateMultiPolicy(undefined);
						this.query.updatePolicyRegistrations(policy.participants?.map(x => x.registrationDetails));
						data[0].participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
						this.getHomebaseParticipantsSummaries(data[0].policyNumber,data[0]).subscribe();
					}
				}
				else {
					this.query.updateMultiPolicy(data);
					this.query.updatePolicy(undefined);
					this.query.updatePolicyRegistrations(undefined);
					data.forEach(policy => {
						this.getHomebaseParticipantsSummaries(policy.policyNumber,policy);
					});
				}
			}));
	}

	policyRefresh(policyNumber: string): OperatorFunction<any, any> {
		return concatMap(x => this.getPolicy(policyNumber).pipe(map(_ => x)));
	}

	getHomebaseParticipantsSummaries(policyNumber: string, data: Policy): Observable<HomebaseParticipantSummaryResponse[]> {
		return this.api.get<HomebaseParticipantSummaryResponse[]>({
			uri: `${this.controller}/${policyNumber}/TMXSummaries`
		}).pipe(
			tap(summariesData => {
				data.participants.forEach(participant => {
					const matchingSummary = summariesData?.find(summary => summary.telematicsId === participant.telematicsId);
					if (matchingSummary) {
						participant.homebaseParticipantSummaryResponse = matchingSummary;
					}
				});
			})
		);
	}
}