import { Injectable } from "@angular/core";
import { HelperService } from "@modules/shared/services/_index";
import { PolicyQuery } from "@modules/customer-service/shared/stores/_index";
import { CommercialParticipantJunction, CommercialPolicy } from "@modules/shared/data/resources";
import { ParticipantStatus } from "@modules/shared/data/enums";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class CommercialPolicyQuery extends PolicyQuery {
	updateParticipantAudio() {
		throw new Error("Method not implemented.");
	}

	protected commercialPolicySubject: BehaviorSubject<CommercialPolicy> = new BehaviorSubject<CommercialPolicy>(undefined);
	commercialPolicy$: Observable<CommercialPolicy> = this.commercialPolicySubject.asObservable();

	protected commercialParticipantSubject: BehaviorSubject<CommercialParticipantJunction[]> = new BehaviorSubject<CommercialParticipantJunction[]>(undefined);
	commercialParticipant$: Observable<CommercialParticipantJunction[]> = this.commercialParticipantSubject.asObservable();

	constructor(helper: HelperService) {
		super(helper);
	}

	//#region Commercial
	updateCommercialPolicy(policy: CommercialPolicy): void {
		this.commercialPolicySubject.next(policy);
		this.commercialParticipantSubject.next(policy.participants);
	}

	updateParticipantOptOut(participantSeqId: number): void {
		let participant = this.commercialParticipantSubject.value.find(p => p.participantSeqId === participantSeqId);
		participant.status = ParticipantStatus.OptOut;
	}

	updateParticipantReenrolled(participantSeqId: number): void {
		let participant = this.commercialParticipantSubject.value.find(p => p.participantSeqId === participantSeqId);
		participant.status = ParticipantStatus.Enrolled;
	}
	//#endregion
}
