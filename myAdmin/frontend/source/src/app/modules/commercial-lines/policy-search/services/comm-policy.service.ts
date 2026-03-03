import { NotificationService } from "@pgr-cla/core-ui-components";
import { Injectable } from "@angular/core";
import { ApiService } from "@modules/core/services/_index";
import { RegistrationService } from "@modules/customer-service/shared/services/_index";
import { CommercialParticipantJunction } from "@modules/shared/data/resources";
import { Observable, OperatorFunction } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import { CommercialPolicy } from "./../../../shared/data/resources";
import { CommercialPolicyQuery } from "../stores/_index";

@Injectable()
export class CommercialPolicyService {

	protected readonly CLcontroller = "/customerService/commercialLines";
	protected readonly deviceController = "/customerService/pluginAction";

	constructor(
		public notificationService: NotificationService,
		private api: ApiService,
		private registration: RegistrationService,
		private policyQuery: CommercialPolicyQuery
	) {
	}

	reEnroll(reenrollment: any) {
		return this.api.post<any>({
			uri: `${this.CLcontroller}/removeOptOutRequest`,
			payload: reenrollment
		}).subscribe
			(data => {
				if (data) {
					this.notificationService.success(
						`Participant Re-enrolled.`
					);
					this.policyQuery.updateParticipantReenrolled(reenrollment.participantSeqId);
				}
			});

	}

	replaceDevice(reenrollment: any) {
		return this.api.post<any>({
			uri: `${this.CLcontroller}/replaceDevice`,
			payload: reenrollment
		}).subscribe
			(data => {
				this.notificationService.success(
					`New Device Order ${data.createdDeviceOrders
						.map(d => d.newDeviceOrderId.toString()).join(", ")} created`
				);
			});

	}

	connectionTimeline(policyNumber: string, participant: CommercialParticipantJunction) {
		return this.api.get<any>({
			uri: `${this.CLcontroller}/connectionTimeline
				?policyNumber=${policyNumber}&participantSeqId=${participant.participantSeqId}&vin=${participant.vin}`
		});
	}

	activateDevice(policyNumber: string, deviceSerialNumber: string) {
		return this.api.post<any>({
			uri: `${this.deviceController}/activateDevice`,
			payload: {
				policyNumber,
				deviceSerialNumber
			}
		}).subscribe
			(data => {
				this.notificationService.success(
					`Device Actived`
				);
				this.getPolicy(policyNumber);
			});
	}

	markAbandon(policyNumber: string, participantSeqId: number, deviceSerialNumber: string, policySuffix?: number, expirationDate?: Date) {
		return this.api.post<any>({
			uri: `${this.deviceController}/abandonDevice`,
			payload: {
				policyNumber,
				participantSeqId,
				deviceSerialNumber,
				policySuffix,
				expirationDate
			}
		}).subscribe
			(data => {
				this.notificationService.success(
					`Device Marked Abandoned`
				);
				this.getPolicy(policyNumber);
			});
	}

	trackShipment(vehicleSeqId: number): void {
		this.api.get<string>({
			uri: `${this.CLcontroller}/getUspsShipTrackingNumber/${vehicleSeqId}`
		}).subscribe(trackingNumber => {
			if (trackingNumber && trackingNumber.trim()) {
				const uspsUrl = `https://tools.usps.com/go/TrackConfirmAction_input?strOrigTrackNum=${trackingNumber}`;
				window.open(uspsUrl, "_blank");
			} else {
				this.notificationService.error("No USPS tracking number found. Opening UPS MI tracking page.");
				window.open("https://tracking.ups-mi.net/packageID", "_blank");
			}
		}, error => {
			this.notificationService.error("Failed to retrieve USPS tracking number. Opening UPS MI tracking page.");
			window.open("https://tracking.ups-mi.net/packageID", "_blank");
		});
	}

	markDefective(policyNumber: string, deviceSerialNumber: string) {
		return this.api.post<any>({
			uri: `${this.deviceController}/markDefective`,
			payload: {
				policyNumber,
				deviceSerialNumber
			}
		}).subscribe
			(data => {
				this.notificationService.success(
					`Device Marked Defective`
				);
				this.getPolicy(policyNumber);
			});
	}

	audioSet(deviceSerialNumber: string, isAudioEnabled: boolean) {
		return this.api.patch<any>({
			uri: `${this.deviceController}/setAudioStatusAWS?isAudioOn=${isAudioEnabled}&deviceSerialNumber=${deviceSerialNumber}`
		}).subscribe(data => {
			this.policyQuery.updateParticipantAudio();
		});
	}

	getAudio(deviceSerialNumber: string): Observable<string> {

		return this.api.get<any>({
			uri: `${this.deviceController}/getAudioStatusAWS?deviceSerialNumber=${deviceSerialNumber}`
		});

	}
	optOut(participantID: number) {
		return this.api.post<any>({
			uri: `${this.CLcontroller}/optOutRequest/${participantID}`

		}).subscribe
			(data => {
				if (data) {
					this.notificationService.success(
						`Participant Opt Out Sucessful`
					);
					this.policyQuery.updateParticipantOptOut(participantID);
				}
			});

	}
	updateParticipant(data: any) {

		console.log(data);
	}

	ResetDevice(deviceSerialNumber: string) {
		return this.api.post<any>({
			uri: `${this.deviceController}/resetDevice/${deviceSerialNumber}`
		}).subscribe
			(data => {
				this.notificationService.success(
					`Reset Device`
				);
			});
	}

	pingDevice(deviceSerialNumber: string): void {
		this.api.post<any>({
			uri: `${this.deviceController}/pingDevice/${deviceSerialNumber}`
		}).subscribe(_ => {
			this.notificationService.success(`Ping Sent to Device. The device could take up to 72 hours to respond.`);
		});

	}

	getPolicy(policyNumber: string): Observable<CommercialPolicy> {
		return this.api.get<CommercialPolicy>({
			uri: `${this.CLcontroller}/Search/ByPolicy/${policyNumber}`
		}).pipe(
			tap(data => {
				this.policyQuery.updateCommercialPolicy(data);
			})
		);
	}

	getPolicyByDeviceId(serialNumber: string) {
		return this.api.get<CommercialPolicy>({
			uri: `${this.CLcontroller}/Search/ByDeviceSerialNumber/${serialNumber}`
		}).pipe(
			tap(data => {
				this.policyQuery.updateCommercialPolicy(data);
			})
		);
	}

	getPolicyByRegistrationCode(registrationCode: string): Observable<CommercialPolicy[]> {
		return this.api.get<CommercialPolicy[]>({ uri: `${this.CLcontroller}/Search/ByRegistration/${registrationCode}` })
			.pipe(tap(data => {
				if (data.length === 1) {
					const policy = data[0];
					this.policyQuery.updateCommercialPolicy(policy);
				}
			}));
	}

	policyRefresh(policyNumber: string): OperatorFunction<any, any> {
		return concatMap(x => this.getPolicy(policyNumber).pipe(map(_ => x)));
	}

	policyUpdate(policy: CommercialPolicy) {
		return this.api.post<any>({
			uri: `${this.CLcontroller}/update`,
			payload: {
				policySeqId: policy.policySeqId,
				address: {
					contactName: policy.address.contactName,
					address1: policy.address.address1,
					address2: policy.address.address2,
					city: policy.address.city,
					state: policy.address.state,
					zipCode: policy.address.zipCode
				},
				emailAddress: policy.emailAddress,
				sendDashboard: policy.sendDashboard
			}
		}).subscribe
			(data => {
				if (data) {
					this.notificationService.success(
						`Policy Updated`
					);
					this.getPolicy(policy.policyNumber);
					this.policyQuery.updateCommercialPolicy(data);
				}
				else {
					this.notificationService.error(
						`Policy Failed to update`
					);
				}
			});
	}
}
