import {
	CompatibilityAction,
	CompatibilityType,
	ExcludedDateRange,
	ExcludedDateRangeReasonCode,
	OptOutSuspension,
	CommercialParticipantJunction,
	CommercialTrips
} from "@modules/shared/data/resources";
import { Observable, forkJoin } from "rxjs";

import { ApiService } from "@modules/core/services/_index";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import { OptOutReasonCode } from "@modules/shared/data/enums";
import { formatDate } from "@angular/common";
import { CommercialPolicyService } from "./comm-policy.service";
import { CommercialPolicyQuery } from "../stores/_index";

@Injectable()
export class CommercialParticipantService {
	private readonly controller = "/customerService/participantAction";
	protected readonly CLcontroller = "/customerService/commercialLines";

	constructor(private api: ApiService, private commercialPolicyService: CommercialPolicyService, private query: CommercialPolicyQuery) {
		this.initStaticData();
	}

	getHistory(participantSeqID: number): Observable<CommercialTrips[]> {
		return this.api.post<CommercialTrips[]>({
			uri: `${this.CLcontroller}/ParticipantHistory`,
			payload: participantSeqID
		});
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
				this.query.updateExcludedDateReasonCodes(data[1].filter(y => y.isActive));
			})).subscribe();
	}

	getExcludedDates(commercialParticipant: CommercialParticipantJunction): Observable<ExcludedDateRange[]> {
		return this.api.get<ExcludedDateRange[]>({ uri: `${this.CLcontroller}/excludedDateRange?participantSeqId=${commercialParticipant.participantSeqId}` });
	}

	getVehicleDetails(vehicleSeqId: number): Observable<any> {
		return this.api.get<{ vehicleSeqId: number; isHeavyTruck: boolean; cableType: string }>({ uri: `${this.CLcontroller}/getVehicleDetails/${vehicleSeqId}` });
	}

	addExcludedDate(CommercialParticipantSeqId: number, excludedDate: ExcludedDateRange): Observable<ExcludedDateRange> {
		return this.api.post<ExcludedDateRange>({
			uri: `${this.CLcontroller}/excludedDateRange`,
			payload: {
				participantSeqId: CommercialParticipantSeqId,
				startDate: excludedDate.rangeStart,
				endDate: excludedDate.rangeEnd,
				reasonCode: excludedDate.excludedDateRangeReasonCode,
				description: excludedDate.description
			}
		});
	}

	updateExcludedDate(CommercialParticipantSeqId: number, excludedDate: ExcludedDateRange): Observable<any> {
		return this.api.put<any>({
			uri: `${this.CLcontroller}/excludedDateRange`,
			payload: {
				participantSeqId: CommercialParticipantSeqId,
				startDate: excludedDate.rangeStart,
				endDate: excludedDate.rangeEnd,
				reasonCode: excludedDate.excludedDateRangeReasonCode,
				description: excludedDate.description
			}
		});
	}

	deleteExcludedDate(CommercialParticipantSeqId: number, startDate: Date): Observable<any> {
		return this.api.delete<any>({
			uri: `${this.CLcontroller}/excludedDateRange`,
			payload: {
				participantSeqId: CommercialParticipantSeqId,
				startDate: startDate
			}
		});
	}

	addOptOutSuspension(payload: {
		CommercialParticipantSeqId: number;
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

	mergeCommercialParticipants(
		policyNumber: string,
		policySuffix: number,
		srcCommercialParticipantId: string,
		destCommercialParticipantId: string): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/merge`,
			payload: {
				policyNumber,
				policySuffix,
				srcCommercialParticipantId,
				destCommercialParticipantId
			}
		}).pipe(this.commercialPolicyService.policyRefresh(policyNumber));
	}

	private stringify(date: Date): string {
		return formatDate(new Date(date), "yyyy-MM-dd HH:mm:ss", "en-US");
	}
}
