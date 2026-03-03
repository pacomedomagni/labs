import {
	MobileDevice,
	ParticipantDeviceTripEvent,
	ParticipantJunction,
	PluginDevice,
	ScoringAlgorithmData,
	SupportPolicy,
	TransactionAuditLog,
	TripSummaryDaily
} from "@modules/shared/data/resources";

import { ApiService } from "@modules/core/services/api/api.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DeviceExperience } from "@modules/shared/data/enums";

@Injectable({ providedIn: "root" })
export class PolicyHistoryService {

	private readonly controller = "/tools/policyHistory";

	constructor(private api: ApiService) { }

	getPolicyInfo(policyNumber: string): Observable<SupportPolicy> {
		return this.api.get<SupportPolicy>({ uri: `${this.controller}/policy/${policyNumber}` });
	}

	getParticipantJunctionInfo(policyNumber: string): Observable<ParticipantJunction[]> {
		return this.api.get<ParticipantJunction[]>({ uri: `${this.controller}/policy/${policyNumber}/participantJunction` });
	}

	getParticipantJunctionInfoFile(policyNumber: string): Observable<Blob> {
		return this.api.get<Blob>({ uri: `${this.controller}/policy/${policyNumber}/participantJunction/csvfile`,options: { responseType : "blob" } });
	}

	getTransactionAuditLogs(policyNumber: string): Observable<TransactionAuditLog[]> {
		return this.api.get<TransactionAuditLog[]>({ uri: `${this.controller}/policy/${policyNumber}/auditLogs` });
	}

	getTransactionAuditLogsFile(policyNumber: string): Observable<Blob> {
		return this.api.getAsync<Blob>({ uri: `${this.controller}/policy/${policyNumber}/auditLogs/csvfile`,options: { responseType : "blob" }});
	}

	getDeviceInfo(deviceSerialNumber: string): Observable<PluginDevice> {
		return this.api.get<PluginDevice>({ uri: `${this.controller}/device/${deviceSerialNumber}` });
	}

	getMobileDeviceInfo(deviceSeqId: number): Observable<MobileDevice> {
		return this.api.get<MobileDevice>({ uri: `${this.controller}/device/mobile/${deviceSeqId}` });
	}

	getTripSummary(junctionData: ParticipantJunction): Observable<TripSummaryDaily[]> {

		let id = this.getId(junctionData);
		return this.api.get<TripSummaryDaily[]>({ uri: `${this.controller}/participant/${id}/trip/summary` });
	}

	getTripSummaryFile(junctionData: ParticipantJunction): Observable<Blob> {

		let id = this.getId(junctionData);
		return this.api.getAsync<Blob>({ uri: `${this.controller}/participant/${id}/trip/summary/csvfile`, options: { responseType : "blob" }} );
	}

	private getId(junctionData: ParticipantJunction): string {
		const scoringAlgorithmCode = junctionData.scoringAlgorithmData.code;
		const is2008Algorithm = scoringAlgorithmCode === 1;
		const isOBD2 = junctionData.deviceExperienceTypeCode === DeviceExperience.Device;
		const is2008 = scoringAlgorithmCode === 3 || scoringAlgorithmCode === 4;

		if (is2008Algorithm || (isOBD2 && is2008)) {
			return `bySeqId/${junctionData.participantSeqID}`;
		}
		else {
			return `byId/${junctionData.participantID}`;
		}
	}

	getParticipantDeviceEvents(participantSeqId: number): Observable<ParticipantDeviceTripEvent[]> {
		return this.api.get<ParticipantDeviceTripEvent[]>({ uri: `${this.controller}/participant/${participantSeqId}/trip/events` });
	}

	getParticipantDeviceEventsFile(participantSeqId: number): Observable<Blob> {
		return this.api.getAsync<Blob>({ uri: `${this.controller}/participant/${participantSeqId}/trip/events/csvfile`,options: { responseType : "blob" }});
	}

	getTripDetails<T>(
		tripSeqId: number,
		date: Date,
		algorithmCode: number,
		experience: DeviceExperience,
		page: number,
		pageSize: number,
		sort: "asc" | "desc" | "",
		filter: string,
		fullResponse: boolean = false): Observable<T> {
		return this.api.postAsync<T>({
			uri: `${this.controller}/trip/details?page=${page}&pageSize=${pageSize}&sortOrder=${sort}&filter=${filter}`,
			payload: {
				tripSeqId,
				date,
				experience,
				algorithm: algorithmCode
			},
			options: { fullResponse },
		});
	}

	getTripDetailsCsv<Blob>(
		tripSeqId: number,
		date: Date,
		algorithmCode: number,
		experience: DeviceExperience,
		page: number,
		pageSize: number,
		sort: "asc" | "desc" | "",
		filter: string,
		fullResponse: boolean = false): Observable<Blob> {
		return this.api.postAsync<Blob>({
			uri: `${this.controller}/trip/details/csvfile?page=${page}&pageSize=${pageSize}&sortOrder=${sort}&filter=${filter}`,
			payload: {
				tripSeqId,
				date,
				experience,
				algorithm: algorithmCode
			},
			options: { fullResponse, responseType : "blob" }
		});
	}
}
