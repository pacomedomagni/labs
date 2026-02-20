import { Injectable } from "@angular/core";
import { ApiOptions } from "@modules/core/services/api/api.service";
import { ApiService } from "@modules/core/services/_index";
import { MobileRegistrationStatus, RegistrationStatusUpdateAction } from "@modules/shared/data/enums";
import { Participant, Registration } from "@modules/shared/data/resources";
import { Observable } from "rxjs";

@Injectable()
export class RegistrationService {

	private readonly controller = "/CustomerService/Registration";

	constructor(private api: ApiService) { }

	getRegistration(telematicsId: string): Observable<Registration> {
		return this.api.get<Registration>({
			uri: `${this.controller}/${telematicsId}`
		});
	}

	getRegistrations(telematicsIds: string[]): Observable<Registration[]> {
		return this.api.post<Registration[]>({
			uri: `${this.controller}`,
			payload: { telematicsIds }
		});
	}

	getRegistrationByPolicy(policyNumber: string, apiOptions?: ApiOptions): Observable<Registration[]> {
		return this.api.get<Registration[]>({
			uri: `${this.controller}/ByPolicy/${policyNumber}`,
			options: apiOptions
		});
	}

	unlockRegistration(registration: Registration): Observable<void> {
		return this.api.post<void>({
			uri: `${this.controller}/Unlock`,
			payload: { ...registration }
		});
	}

	updateRegistrationCode(
		policyNumber: string,
		newRegistrationCode: string,
		participant: Participant,
		conflictingRegistrationSeqIds: number[],
		apiOptions?: ApiOptions): Observable<void> {
		return this.api.put<void>({
			uri: `${this.controller}/RegistrationCode`,
			payload: { policyNumber, newRegistrationCode, participant, conflictingRegistrationSeqIds },
			options: apiOptions
		});
	}

	getConflictingRegistrations(registrationCode: string, apiOptions?: ApiOptions): Observable<Registration[]> {
		return this.api.get<Registration[]>({
			uri: `${this.controller}/RegistrationCode/${registrationCode}/Conflicts`,
			options: apiOptions
		});
	}

	updateRegistrationStatus(policyNumber: string, registrationSeqId: number, telematicsId: string, updateAction: RegistrationStatusUpdateAction): Observable<MobileRegistrationStatus> {
		return this.api.put<MobileRegistrationStatus>({
			uri: `${this.controller}/RegistrationStatusCode`,
			payload: { policyNumber, registrationSeqId, telematicsId, updateAction }
		});
	}
}
