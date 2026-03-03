import { Address, Registration, Participant, Policy, HomebaseParticipantSummaryResponse } from "@modules/shared/data/resources";
import { Observable, forkJoin, OperatorFunction } from "rxjs";
import { concatMap, map, take, tap } from "rxjs/operators";

import { ApiService } from "@modules/core/services/_index";
import { Injectable } from "@angular/core";
import { ApiOptions } from "@modules/core/services/api/api.service";
import { PolicyService, RegistrationService } from "@modules/customer-service/shared/services/_index";
import { SnapshotPolicyQuery } from "../stores/_index";

@Injectable()
export class SnapshotPolicyService extends PolicyService {

	private readonly childController = `${this.controller}/Snapshot`;

	constructor(
		protected api: ApiService,
		protected registration: RegistrationService,
		protected policyQuery: SnapshotPolicyQuery) {
		super(api, registration, policyQuery);
	}

	getPolicy(policyNumber: string, updateDataStore: boolean = true): Observable<Policy> {
		if (updateDataStore) {
			return this.api.get<Policy>({ uri: `${this.controller}/Search/ByPolicy/${policyNumber}` })
				.pipe(
					tap(data => {
						if (!this.isSnapshotPolicy(data)) {
							this.setDataToNotFound(data);
						}
						else {
							this.registration.getRegistrationByPolicy(data.policyNumber)
								.pipe(
									take(1),
									tap(registrations => {
										this.query.updatePolicy(data);
										this.query.updateMultiPolicy(undefined);
										this.query.updatePolicyRegistrations(registrations);
										data.participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
										this.getHomebaseParticipantsSummaries(policyNumber,data).subscribe();
									})).subscribe();
						}
					})
				);
		}
		else {
			return this.api.get<Policy>({
				uri: `${this.controller}/${policyNumber}`
			});
		}
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

	getPolicyByRegistrationCode(registrationCode: string): Observable<Policy[]> {
		return this.api.get<Policy[]>({ uri: `${this.controller}/Search/ByRegistration/${registrationCode}` })
			.pipe(tap(data => {
				if (data.length === 1) {
					const policy = data[0];
					if (!this.isSnapshotPolicy(policy)) {
						this.setDataToNotFound(policy);
					} else {
						forkJoin([
							this.registration.getRegistrationByPolicy(policy.policyNumber)
						]).pipe(
							take(1),
							tap(results => {
								this.query.updatePolicy(policy);
								this.query.updateMultiPolicy(undefined);
								this.query.updatePolicyRegistrations(results[0]);
								data[0].participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
								this.getHomebaseParticipantsSummaries(data[0].policyNumber,data[0]).subscribe();
							})).subscribe();
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

	searchByPolicySuffix(policyNumber: string, policySuffix: number, expirationYear: number): Observable<Policy> {
		return this.api.get<Policy>({ uri: `${this.controller}/Search/ByPolicy/${policyNumber}?policySuffix=${policySuffix}&expirationYear=${expirationYear}` })
			.pipe(tap(data => {
				this.query.updatePolicy(data);
				this.query.updateMultiPolicy(undefined);
				data[0].participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
				this.getHomebaseParticipantsSummaries(data[0].policyNumber,data[0]).subscribe();
			}));
	}

	getPolicyByDeviceId(serialNumber: string): Observable<Policy> {
		return this.api.get<Policy>({ uri: `${this.controller}/Search/ByPluginDevice/${serialNumber}` })
			.pipe(tap(data => {
				this.query.updatePolicy(data);
				this.query.updateMultiPolicy(undefined);
				this.query.updatePolicyRegistrations(undefined);
				data.participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
				this.getHomebaseParticipantsSummaries(data.policyNumber,data).subscribe();
			}));
	}

	updateMailingAddress(policyNumber: string, address: Address): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/MailingAddress`,
			payload: { ...address, policyNumber }
		}).pipe(
			tap(_ => {
				this.query.updatePolicyMailingAddress(address);
			}));
	}

	updateAppAssignment(policyNumber: string, appName: string): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/AppAssignment`,
			payload: { policyNumber, appName }
		}).pipe(
			tap(_ => {
				this.policyQuery.updatePolicyAppAssignment(appName);
			}));
	}

	getMobileRegistrations(policyNumber: string, apiOptions?: ApiOptions): Observable<Registration[]> {
		return this.registration.getRegistrationByPolicy(policyNumber, apiOptions).pipe(
			tap(data => this.policyQuery.updatePolicyRegistrations(data))
		);
	}

	transferParticipantData(oldPolicy: Policy, newPolicy: Policy): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/${oldPolicy.policyNumber}/Participant/Transfer`,
			payload: { oldPolicy, newPolicy }
		}).pipe(this.policyRefresh(oldPolicy.policyNumber));
	}

	getTransferEligibleParticipants(oldPolicyNumber: string, newPolicyNumber: string): Observable<Participant[]> {
		return this.api.get<Participant[]>({
			uri: `${this.controller}/${oldPolicyNumber}/Participant/Transfer/Eligibility?newPolicyNumber=${newPolicyNumber}`
		});
	}

	policyRefresh(policyNumber: string): OperatorFunction<any, any> {
		return concatMap(x => this.getPolicy(policyNumber).pipe(map(_ => x)));
	}

	getPolicyByMobileIdentifier(mobileIdentifier: string) {
		return this.api.get<Policy>({ uri: `${this.controller}/Search/ByMobileIdentifier/${mobileIdentifier}` })
			.pipe(tap(data => {
				this.query.updatePolicy(data);
				this.query.updateMultiPolicy(undefined);
				if (this.isSnapshotPolicy(data)) {

					forkJoin([
						this.registration.getRegistrationByPolicy(data.policyNumber)
					]).pipe(
						take(1),
						tap(results => {
							this.query.updatePolicy(data);
							this.query.updateMultiPolicy(undefined);
							this.query.updatePolicyRegistrations(results[0]);
							data.participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
							this.getHomebaseParticipantsSummaries(data.policyNumber,data).subscribe();
						})).subscribe();
				} else {
					this.query.updatePolicyRegistrations(undefined);
				}
			}));
	}
}
