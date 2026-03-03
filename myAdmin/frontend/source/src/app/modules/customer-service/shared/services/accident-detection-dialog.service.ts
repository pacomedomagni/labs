import { Injectable } from "@angular/core";
import { LoadingService } from "@modules/core/services/_index";
import { Participant, Policy, Registration } from "@modules/shared/data/resources";
import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { HelpText } from "../help/metadata";
import { UnenrollmentParticipantComponent } from "../components/unenroll-participant/unenroll-participant.component";
import { AccidentDetectionService } from "./accident-detection.service";

@Injectable()
export class AccidentDetectionDialogService {

	constructor(
		private accidentDetectionService: AccidentDetectionService,
		private labelService: LabelService,
		private enums: EnumService,
		private dialogService: DialogService,
		private loadingService: LoadingService,
		private notificationService: NotificationService
	) { }

	openUnenrollmentParticipantDialog(policyNumber: string, participant: Participant, registration: Registration, policyRefresh$: Observable<Policy>): void {
		const subtitle = participant ?
			this.labelService.getDialogSubtitleForParticipant(participant) :
			`${registration.driverFirstName} ${registration.driverLastName}`;

		this.dialogService.openFormDialog({
			title: "Unenrollment Participant",
			subtitle,
			component: UnenrollmentParticipantComponent,
			formModel: { unenrollmentReasons: ["Customer Initiated"] },
			componentData: registration.mobileRegistrationCode,
			helpKey: HelpText.UnenrollParticipant
		});

		this.dialogService.confirmed().subscribe(x => {

			this.accidentDetectionService.unenrollParticipant(participant.telematicsId, "UserInitiated")
				.pipe(tap(_ => policyRefresh$.subscribe()))
				.subscribe(() => {
					this.notificationService.success(`Participant has been succcessfully unenrolled.`);
					this.loadingService.stopLoading();
			});
		});
	}
}
