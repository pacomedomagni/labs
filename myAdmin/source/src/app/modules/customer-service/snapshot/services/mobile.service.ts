import { ApiService } from "@modules/core/services/_index";
import { Injectable } from "@angular/core";
import { concat, Observable } from "rxjs";
import { Registration, Participant, MobileContext } from "@modules/shared/data/resources";
import { map, toArray } from "rxjs/operators";
import { ApiOptions } from "@modules/core/services/api/api.service";
import { MobileRegistrationStatus, RegistrationStatusUpdateAction } from "@modules/shared/data/enums";
import { SnapshotPolicyService } from "./snapshot-policy.service";
import { SnapshotPolicyQuery } from "../stores/_index";

@Injectable()
export class MobileService {

	private readonly controller = "/customerService/mobileAction";

	constructor(private snapshotPolicyService: SnapshotPolicyService, private api: ApiService, private query: SnapshotPolicyQuery) { }

	updateMobileNumber(policyNumber: string, participant: Participant, mobileNumber: string, conflictIds: number[], apiOptions?: ApiOptions): Observable<any> {
		return concat(
			this.api.put<any>({
				uri: `${this.controller}/changeMobileNumber`,
				payload: {
					policyNumber,
					mobileId: mobileNumber,
					registrationSeqId: participant.registrationDetails?.mobileRegistrationSeqId,
					participantStatus: participant.snapshotDetails.status,
					participantReasonCode: participant.snapshotDetails.reasonCode,
					optOutReasonCode: participant.snapshotDetails.optOutDetails?.reason,
					optOutDate: participant.snapshotDetails.optOutDetails?.date,
					sequenceIdsOfConflictingRoadTestLabsParticipants: conflictIds
				},
				options: apiOptions
			}),
			this.snapshotPolicyService.refreshParticipant(participant.snapshotDetails.participantSeqId),
			this.snapshotPolicyService.getMobileRegistrations(policyNumber, apiOptions)
		).pipe(
			toArray(),
			map(data => data[0]));
	}

	unlockRegistration(policyNumber: string, mobileRegistrationCode: string, registration: Registration, newMobileRegistrationStatus: MobileRegistrationStatus): Observable<Registration> {
		return this.api.post<any>({
			uri: `${this.controller}/unlockRegistration`,
			payload: {
				mobileRegistrationCode,
				registrationSeqId: registration.mobileRegistrationSeqId,
				programCode: registration.programCode.toString(),
				newMobileRegistrationStatus
			}
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}

	returnConflictMobileDeviceRegistrations(mobileNumber: string, options?: ApiOptions): Observable<Registration[]> {
		return this.api.put<any>({
			uri: `${this.controller}/returnConflictMobileDeviceRegistrations?mobileId=${mobileNumber}`,
			options
		});
	}

	swapDriver(policyNumber: string, srcParticipantSeqId: number, destParticipantSeqId: number): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/swapDriver`,
			payload: {
				policyNumber,
				srcParticipantSeqId,
				destParticipantSeqId
			}
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}

	switchMobileToPlugin(policyNumber: string, participantSeqId: number): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/switchToOBD`,
			payload: {
				policyNumber,
				participantSeqId
			}
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}

	getAssociatedRegistrations(groupExternalId: string): Observable<Registration[]> {
		return this.api.get<Registration[]>({
			uri: `${this.controller}/getRegistrations/${groupExternalId}`
		});
	}

	returnMobileContexts(participantSeqId: number): Observable<MobileContext[]> {
		return this.api.get<MobileContext[]>({
			uri: `${this.controller}/ReturnMobileContexts?participantSeqId=${participantSeqId}`
		});
	}

	updateRegistrationStatus(policyNumber: string, registrationSeqId: number, action: RegistrationStatusUpdateAction): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/updateRegistrationStatus`,
			payload: {
				policyNumber,
				registrationSeqId,
				action
			}
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}
}
