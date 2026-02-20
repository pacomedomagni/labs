import { DeviceHistory, DeviceLocationInfo, Participant, ParticipantCalculatedInitialValues, PluginDevice } from "@modules/shared/data/resources";

import { ApiService } from "@modules/core/services/_index";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { StopShipmentMethod } from "@modules/shared/data/enums";
import { SnapshotPolicyService } from "./snapshot-policy.service";
import { SnapshotPolicyQuery } from "../stores/_index";

@Injectable()
export class DeviceService {

	private readonly controller = "/customerService/pluginAction";

	constructor(private api: ApiService, private query: SnapshotPolicyQuery, private snapshotPolicyService: SnapshotPolicyService) { }

	abandonDevice(policyNumber: string, participant: Participant, deviceSerialNumber: string, policySuffix?: number, expirationDate?: Date): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/abandonDevice`,
			payload: {
				policyNumber,
				participantSeqId: participant.snapshotDetails.participantSeqId,
				deviceSerialNumber,
				policySuffix,
				expirationDate
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	suspendDevice(suspendDeviceSeqIds: number[], participant: Participant): Observable<any> {

		return this.api.put<any>({
			uri: `${this.controller}/updateSuspensions`,
			payload: {
				deviceSeqId: suspendDeviceSeqIds
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	getDeviceHistory(participantSeqId?: number, serialNumber?: string): Observable<DeviceHistory> {
		let queryParms = "";
		if (participantSeqId) {
			queryParms += `participantSeqId=${participantSeqId}`;
		}
		if (serialNumber) {
			if (queryParms !== "") {
				queryParms += "&";
			}
			queryParms += `serialNumber=${serialNumber}`;
		}

		return this.api.get<DeviceHistory>({
			uri: `${this.controller}/deviceHistory?${queryParms}`
		});
	}

	activateDevice(policyNumber: string, participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/activateDevice`,
			payload: {
				policyNumber,
				deviceSerialNumber: participant.pluginDeviceDetails?.deviceSerialNumber
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	connectionTimeline(policyNumber: string, participant: Participant): Observable<any> {
		return this.api.get<any>({
			uri: `${this.controller}/connectionTimeline
				?policyNumber=${policyNumber}&participantSeqId=${participant.snapshotDetails.participantSeqId}&vin=${participant.snapshotDetails.vehicleDetails.vin}
				&programType=${participant.snapshotDetails.programType}`
		});
	}

	cancelReplacementDevice(policyNumber: string, participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/cancelReplaceDevice`,
			payload: {
				policyNumber,
				participantSeqId: participant.snapshotDetails.participantSeqId
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	deviceInfoDetails(serialNumber: string, participantSeqId?: number): Observable<PluginDevice> {
		let queryParms = "";
		if (participantSeqId) {
			queryParms += `&participantSeqId=${participantSeqId}`;
		}

		return this.api.get<PluginDevice>({
			uri: `${this.controller}/deviceInfo/${serialNumber}?includeDetailedInfo=true${queryParms}`
		});
	}

	getAudioStatus(participant: Participant): Observable<any> {
		return this.api.get<any>({
			uri: `${this.controller}/getAudioStatusAWS?deviceSerialNumber=${participant.pluginDeviceDetails.deviceSerialNumber}`
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	setAudioStatus(participant: Participant, isAudioOn: boolean): Observable<any> {
		return this.api.patch<any>({
			uri: `${this.controller}/setAudioStatusAWS?isAudioOn=${isAudioOn}&deviceSerialNumber=${participant.pluginDeviceDetails.deviceSerialNumber}`
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	markDeviceDefective(policyNumber: string, participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/markDefective`,
			payload: {
				policyNumber,
				deviceSerialNumber: participant.pluginDeviceDetails?.deviceSerialNumber
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	pingDevice(participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/pingDevice/${participant.pluginDeviceDetails?.deviceSerialNumber}`
		});
	}

	replaceDevice(policyNumber: string, participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/replaceDevice`,
			payload: {
				policyNumber,
				participantSeqId: participant.snapshotDetails.participantSeqId
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	resetDevice(participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/resetDevice/${participant.pluginDeviceDetails?.deviceSerialNumber}`
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	updateDeviceAudio(participant: Participant, isAudioEnabled: boolean): Observable<any> {
		return this.api.put<any>({
			uri: `${this.controller}/updateAudio`,
			payload: { deviceSerialNumber: participant.pluginDeviceDetails?.deviceSerialNumber, isAudioEnabled }
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	locationInformation(participant: Participant): Observable<DeviceLocationInfo> {
		if (participant.pluginDeviceDetails?.deviceSerialNumber !== undefined && participant.snapshotDetails.lastContactDateTime !== undefined) {
			return this.api.get<DeviceLocationInfo>({
				uri: `${this.controller}/deviceLocationData/${participant.pluginDeviceDetails.deviceSerialNumber}
					?lastContactDate=${participant.snapshotDetails.lastContactDateTime.toISOString()}`
			});
		}
		else {
			return of({} as DeviceLocationInfo);
		}
	}

	swapDevices(policyNumber: string, sourceParticipantSeqId: number, destParticipantSeqId: number): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/swapDevice`,
			payload: { policyNumber, sourceParticipantSeqId, destParticipantSeqId }
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}

	stopShipment(policyNumber: string, policyPeriodSeqId: number, participant: Participant, stopShipmentMethod: StopShipmentMethod): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/stopShipment`,
			payload: { policyNumber, participantSeqId: participant.snapshotDetails.participantSeqId, policyPeriodSeqId, stopShipmentMethod }
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	feeReversal(deviceSerialNumber: string, expirationYear: number, participantSeqId: number, policyNumber: string, policySuffix: number): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/feeReversal`,
			payload: { deviceSerialNumber, expirationYear, participantSeqId, policyNumber, policySuffix }
		}).pipe(this.snapshotPolicyService.participantRefresh(participantSeqId));
	}

	reEnrollInMobile(policyNumber: string, participantId: string, mobileId: string): Observable<any> {
		return this.api.post({
			uri: `${this.controller}/mobileReEnroll`,
			payload: {
				policyNumber,
				participantId,
				mobileId
			}
		}).pipe(this.snapshotPolicyService.policyRefresh(policyNumber));
	}

	getInitialDiscountInfo(participantSeqId: number): Observable<ParticipantCalculatedInitialValues> {
		return this.api.get<ParticipantCalculatedInitialValues>({
			uri: `${this.controller}/initialDiscount?participantSeqId=${participantSeqId}`
		});
	}

	addInitialDiscountRecord(policyNumber: string, participantSeqId: number): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/initialDiscount`,
			payload: { policyNumber, participantSeqId }
		}).pipe(this.snapshotPolicyService.participantRefresh(participantSeqId));
	}

	updateAdminStatusToActive(policyNumber: string, participant: Participant): Observable<any> {
		let participantID = participant.snapshotDetails.participantId;
		let deviceSerialNumber = participant.pluginDeviceDetails.deviceSerialNumber;
		return this.api.post<any>({
			uri: `${this.controller}/updateAdminStatusToActive`,
			payload: {policyNumber,	participantID, deviceSerialNumber}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	updateAdminStatusForOptOut(policyNumber: string, participant: Participant): Observable<any> {
		return this.api.post<any>({
			uri: `${this.controller}/updateAdminStatusForOptOut`,
			payload: {
				policyNumber,
				participantID: participant.snapshotDetails.participantId
			}
		}).pipe(this.snapshotPolicyService.participantRefresh(participant.snapshotDetails.participantSeqId));
	}

	getUspsShipTrackingNumber(deviceSerialNumber: string): Observable<string> {
		return this.api.get<string>({
			uri: `${this.controller}/getUspsShipTrackingNumber/${deviceSerialNumber}`
		});
	}
}
