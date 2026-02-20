import { Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable } from "rxjs";
import { ParticipantJunction } from "@modules/shared/data/resources";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { DialogService } from "@modules/shared/services/_index";
import { LabelService } from "@modules/shared/services/label-service/label.service";
import { DeviceExperience } from "@modules/shared/data/enums";
import { TripDetailsComponent } from "./trip-details/trip-details.component";
import { PolicyHistoryService } from "../../services/policy-history.service";

@UntilDestroy()
@Component({
    selector: "tmx-policy-history-participant-junction",
    templateUrl: "./participant-junction.component.html",
    styleUrls: ["./participant-junction.component.scss"],
    standalone: false
})
export class ParticipantJunctionComponent implements OnInit {
	@Input() data: Observable<ParticipantJunction[]>;

	junctionDataSubject: BehaviorSubject<any[]> =
		new BehaviorSubject<any>(undefined);

	participantInfo: { id: number; displayName: string }[];
	junctionData$: Observable<any> = this.junctionDataSubject.asObservable();

	constructor(
		public labelService: LabelService,
		private dialogService: DialogService,
		private policyHistoryService: PolicyHistoryService
	) { }

	ngOnInit(): void {
		this.data.pipe(untilDestroyed(this)).subscribe((data) => {
			data.sort(
				(x, y) =>
					x.vehicleSeqID - y.vehicleSeqID ||
					x.participantSeqID - y.participantSeqID ||
					y.policySuffix - x.policySuffix ||
					y.junctionVersionSeq - x.junctionVersionSeq
			);

			const mapped = data.reduce((x, y) => {
				x[y.participantSeqID] = x[y.participantSeqID] || [];
				x[y.participantSeqID].push(y);
				return x;
			}, Object.create(null));

			this.participantInfo = Object.keys(mapped).map((x) => ({
				id: Number(x),
				displayName: this.getParticipantName(mapped[x])
			}));
			this.participantInfo.forEach(
				(x) =>
				(mapped[x.id] = new BehaviorSubject<ParticipantJunction[]>(
					mapped[x.id]
				))
			);
			this.junctionDataSubject.next(mapped);
		});
	}

	private getParticipantName(data: ParticipantJunction[]): string {
		const currentJunction = data[data.length - 1] as ParticipantJunction;
		return !!currentJunction.ymm
			? currentJunction.ymm
			: currentJunction.mobileDeviceAliasName;
	}

	openTripDetails(id: number): void {
		const junctionData = this.junctionDataSubject.value[id].value;
		const currentJunction = junctionData[junctionData.length - 1];
		const experience = currentJunction.deviceExperienceTypeCode;
		const scoringAlgorithmData = currentJunction.scoringAlgorithmData;

		forkJoin([
			this.policyHistoryService.getTripSummary(currentJunction),
			this.policyHistoryService.getParticipantDeviceEvents(id)
		]).subscribe((data) => {
			this.dialogService.openInformationDialog({
				title: "Trips & Events",
				subtitle: this.getDialogSubtitle(currentJunction),
				component: TripDetailsComponent,
				componentData: {
					trips: data[0],
					events: data[1],
					experience,
					algorithmData: scoringAlgorithmData,
					currentJunction,
					id
				},
				width: CUI_DIALOG_WIDTH.FULL
			});
		});
	}

	getDialogSubtitle(data: ParticipantJunction): string {
		if (
			data.deviceExperienceTypeCode !== DeviceExperience.Mobile ||
			(data.deviceExperienceTypeCode === DeviceExperience.Mobile &&
				data.scoringAlgorithmData.code <= 2)
		) {
			return `Vehicle: ${data.ymm} (${data.vin})<p>Device Serial #: ${data.deviceSerialNumber ?? ""
				}</p>`;
		} else {
			return `Nickname: ${data.mobileDeviceAliasName}`;
		}
	}
}
