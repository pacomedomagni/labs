import {
	CompatibilityAction,
	CompatibilityItem,
	CompatibilityType,
	ExcludedDateRange,
	ExcludedDateRangeReasonCode,
	InitialParticipantScoreInProcess,
	OptOutSuspension,
	Participant,
	ParticipantCalculatedValues,
	TripSummary
} from "@modules/shared/data/resources";
import { Observable, forkJoin } from "rxjs";

import { ApiService } from "@modules/core/services/_index";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import { OptOutReasonCode } from "@modules/shared/data/enums";
import { formatDate } from "@angular/common";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { SnapshotPolicyService } from "./snapshot-policy.service";
import { SnapshotPolicyQuery } from "../stores/_index";

@Injectable()
export class ParticipantService {

	private readonly controller = "/customerService/participantAction";
	private readonly v2controller = "/v2/customerService/participantAction";

	constructor(private api: ApiService,
		private notificationService: NotificationService,
		private snapshotPolicyService: SnapshotPolicyService,
		private query: SnapshotPolicyQuery) {
		this.initStaticData();
	}

	public initStaticData(): void {
		forkJoin([
			this.api.getAsync<CompatibilityAction[]>({ uri: `${this.controller}/compatibilityActions` }),
			this.api.getAsync<CompatibilityType[]>({ uri: `${this.controller}/compatibilityTypes` }),
			this.api.getAsync<ExcludedDateRangeReasonCode[]>({ uri: `${this.controller}/excludedDateRangeReasons` })
		]).pipe(
			tap(data => {
				this.query.updateCompatibilityActions(data[0].filter(y => y.isActive));
				this.query.updateCompatibilityTypes(data[1].filter(y => y.isActive));
				this.query.updateExcludedDateReasonCodes(data[2].filter(y => y.isActive));
			})).subscribe();
	}

	getUbiScoreData(participant: Participant): Observable<ParticipantCalculatedValues> {
		return this.api.get<ParticipantCalculatedValues>({ uri: `${this.controller}/scoreData/${participant.snapshotDetails.participantSeqId}` });
	}

	getTripSummary(participant: Participant): Observable<TripSummary> {
		return this.api.get<TripSummary>(
			{
				uri: `${this.v2controller}/${participant.snapshotDetails.participantId}/tripSummary/
				${participant.snapshotDetails.participantSeqId}/${participant.snapshotDetails.enrollmentExperience}/${participant.snapshotDetails.scoringAlgorithmData.code}`
			}
		);
	}

	getExcludedDates(participant: Participant): Observable<ExcludedDateRange[]> {
		return this.api.get<ExcludedDateRange[]>({ uri: `${this.controller}/excludedDateRange/${participant.snapshotDetails.participantId}` });
	}

	addExcludedDate(participantId: string, excludedDate: ExcludedDateRange): Observable<ExcludedDateRange> {
		return this.api.post<ExcludedDateRange>({
			uri: `${this.controller}/excludedDateRange`,
			payload: {
				participantId,
				startDate: this.stringify(excludedDate.rangeStart),
				endDate: this.stringify(excludedDate.rangeEnd),
				reasonCode: excludedDate.excludedDateRangeReasonCode,
				description: excludedDate.description
			}
		});
	}

	updateExcludedDate(participantId: string, excludedDate: ExcludedDateRange): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/excludedDateRange`,
			payload: {
				participantId,
				startDate: this.stringify(excludedDate.rangeStart),
				endDate: this.stringify(excludedDate.rangeEnd),
				reasonCode: excludedDate.excludedDateRangeReasonCode,
				description: excludedDate.description
			}
		});
	}

	deleteExcludedDate(participantId: string, startDate: Date): Observable<any> {
		return this.api.delete<any>({
			uri: `${this.controller}/excludedDateRange`,
			payload: {
				participantId,
				startDate: this.stringify(startDate)
			}
		});
	}

	getOptOutSuspensions(participant: Participant): Observable<OptOutSuspension[]> {
		return this.api.get<OptOutSuspension[]>(
			{ uri: `${this.controller}/optOutSuspension/${participant.snapshotDetails.participantSeqId}` }
		);
	}

	getRenewalScoreData(participant: Participant): Observable<ParticipantCalculatedValues[]> {
		return this.api.get<ParticipantCalculatedValues[]>({ uri: `${this.controller}/renewalScoreData/${participant.snapshotDetails.participantSeqId}` });
	}

	updateEnrollmentDate(policyNumber: string, participant: Participant, enrollmentDate: Date): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/updateEnrollment`,
			payload: {
				policyNumber,
				participantSeqId: participant.snapshotDetails.participantSeqId,
				newEnrollmentDate: enrollmentDate
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	updateEnrollmentDate20(
		policyNumber: string,
		participant: Participant,
		enrollmentDate: Date,
		endorsementAppliedDate: Date,
		shouldRecalculateScore: boolean): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/updateEnrollment20`,
			payload: {
				policyNumber,
				participantSeqId: participant.snapshotDetails.participantSeqId,
				newEnrollmentDate: enrollmentDate,
				endorsementAppliedDate,
				shouldRecalculateScore
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	addOptOutSuspension(payload: {
		participantSeqId: number;
		deviceSeqId: number;
		startDate: Date;
		endDate: Date;
		reasonCode: OptOutReasonCode;
	}): Observable<number> {
		return this.api.post<number>({
			uri: `${this.controller}/optOutSuspension`,
			payload
		});
	}

	cancelOptOutSuspension(suspensions: OptOutSuspension[]): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/optOutSuspension/cancel`,
			payload: { optOutSeqIds: suspensions.map(x => x.seqId) }
		});
	}

	updatePproGuid(policyNumber: string, participantSeqId: number, newGuid: string): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/updateGuid`,
			payload: { policyNumber, participantSeqId, newGuid }
		}).pipe(this.snapshotPolicyService.participantRefresh(participantSeqId));
	}

	mergeParticipants(
		policyNumber: string,
		policySuffix: number,
		srcParticipantId: string,
		destParticipantId: string): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/merge`,
			payload: {
				policyNumber,
				policySuffix,
				srcParticipantId,
				destParticipantId
			}
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}

	getInitialParticipantScoreInProcess(participantSeqId: number): Observable<InitialParticipantScoreInProcess> {
		return this.api.get<InitialParticipantScoreInProcess>({
			uri: `${this.controller}/initialParticipationScoreInProcess/${participantSeqId}`
		});
	}

	updateCompatibilityIssue(compatibilityItem: CompatibilityItem): Observable<any> {
		return this.api.put<CompatibilityItem>({
			uri: `${this.controller}/updateCompatibilityIssue`,
			payload: compatibilityItem
		}).pipe(this.snapshotPolicyService.participantRefresh(compatibilityItem.participantSeqId));
	}

	addCompatibilityIssue(compatibilityItem: CompatibilityItem): Observable<any> {
		return this.api.post<CompatibilityItem>({
			uri: `${this.controller}/addCompatibilityIssue`,
			payload: compatibilityItem
		}).pipe(this.snapshotPolicyService.participantRefresh(compatibilityItem.participantSeqId));
	}

	private stringify(date: Date): string {
		return formatDate(new Date(date), "yyyy-MM-dd HH:mm:ss", "en-US");
	}
}
