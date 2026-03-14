import { Injectable } from "@angular/core";
import { ApiService } from "@modules/core/services/_index";
import { MessageCode } from "@modules/shared/data/enums";
import { HomebaseParticipantSummaryResponse, Participant, Policy } from "@modules/shared/data/resources";
import { Observable, of, OperatorFunction } from "rxjs";
import { concatMap, delay, map, switchMap, tap } from "rxjs/operators";
import { PolicyQuery } from "../stores/policy-query";
import { RegistrationService } from "./registration.service";

@Injectable()
export class PolicyService {

	protected readonly controller = "/CustomerService/Policy";

	constructor(
		protected api: ApiService,
		protected registration: RegistrationService,
		protected query: PolicyQuery) { }

	getPolicy(policyNumber: string): Observable<Policy> {
		return this.api.get<Policy>({
			uri: `${this.controller}/Search/ByPolicy/${policyNumber}`
		}).pipe(
			tap(data => {
				data.participants?.map(x => x.homebaseParticipantSummaryResponse = new HomebaseParticipantSummaryResponse());
			}),
			switchMap(data => this.getHomebaseParticipantsSummaries(policyNumber, data).pipe(
				map(() => data)
			))
		);
	}

	getHomebaseParticipantsSummaries(policyNumber: string, data: Policy): Observable<HomebaseParticipantSummaryResponse[]> {
		return this.api.get<HomebaseParticipantSummaryResponse[]>({
			uri: `${this.controller}/${policyNumber}/TMXSummaries`
		}).pipe(
			tap(summariesData => {
				data.participants?.forEach(participant => {
					const matchingSummary = summariesData?.find(summary => summary.telematicsId === participant.telematicsId);
					if (matchingSummary) {
						participant.homebaseParticipantSummaryResponse = matchingSummary;
					}
				});
			})
		);
	}

	getPolicyBySuffix(policyNumber: string, policySuffix: number, expirationYear: number): Observable<Policy> {
		return this.api.get<Policy>({ uri: `${this.controller}/Search/ByPolicy/${policyNumber}?policySuffix=${policySuffix}&expirationYear=${expirationYear}` })
			.pipe(tap(data => {
				this.query.updatePolicy(data);
				this.query.updateMultiPolicy(undefined);
			}));
	}

	refreshParticipant(participantSeqId: number): Observable<Participant> {
		if (participantSeqId === undefined) {
			return of({} as Participant).pipe(delay(500));
		}
		else {
			return this.api.get<Participant>({
				uri: `${this.controller}/${this.query.activePolicyNumber}/Participant/SeqId/${participantSeqId}`
			}).pipe(tap(data => this.query.updateParticipant(data)));
		}
	}

	participantRefresh(participantSeqId: number): OperatorFunction<any, any> {
		return concatMap(x => this.refreshParticipant(participantSeqId).pipe(map(_ => x)));
	}

	protected isSnapshotPolicy(policy: Policy): boolean {
		return policy.snapshotDetails !== undefined;
	}

	protected isArePolicy(policy: Policy): boolean {
		return policy.areDetails !== undefined;
	}

	protected setDataToNotFound(policy: Policy): void {
		policy = {
			policyNumber: "-1",
			messages: []
		} as Policy;
		policy.messages[MessageCode.Error] = "Policy Not Found";
		this.query.updatePolicy(policy);
		this.query.updateMultiPolicy(undefined);
		this.query.updatePolicyRegistrations(undefined);
	}

	getTransactionError(policyNumber: any) {
		return this.api.get<string>({
			uri: `${this.controller}/${policyNumber}/TransactionAlert`
		}).subscribe(x => this.query.updateTransactionError(x));
	}
}
