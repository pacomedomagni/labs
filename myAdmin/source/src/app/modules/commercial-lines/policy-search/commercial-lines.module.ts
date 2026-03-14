import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@modules/shared/shared.module";
import { CoreModule } from "@modules/core/core.module";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { CustomerServiceSharedModule } from "@modules/customer-service/shared/customer-service-shared.module";
import { CommercialPolicyService } from "./services/comm-policy.service";
import { CommercialParticipantService } from "./services/participant.service";
import { CommercialPolicyQuery } from "./stores/comm-policy-query";
import { CLParticipantActionsComponent } from "./components/commercial-participant-actions/commercial-participant-actions.component";
import { CLPolicyActionsComponent } from "./components/commercial-policy-actions/commercial-policy-actions.component";
import { CLParticipantDetailsComponent } from "./components/commercial-participant-details/commercial-participant-details.component";
import { CLPolicyDetailsComponent } from "./components/commercial-policy-details/commercial-policy-details.component";
import { CommercialLinesContainerComponent } from "./components/commercial-container/commercial-container.component";
import { ClExcludeDateRangeComponent } from "./dialogs/exclude-date-range/commercial-exclude-date-range.component";
import { ClExcludeDateRangeEditComponent } from "./dialogs/exclude-date-range-edit/commercial-exclude-date-range-edit.component";
import { ClReplaceDeviceComponent } from "./dialogs/commercial-replace-device/commercial-replace-device.component";
import { ClViewTripsComponent } from "./dialogs/commercial-view-trips/commercial-view-trips.component";
import { ClParticipantHistoryComponent } from "./dialogs/commercial-participant-history/commercial-participant-history.component";
import { ClConnectionTimelineComponent } from "./dialogs/commercial/commercial-connection-timeline.component";
import { ClExcludedDateRangeComponent } from "./dialogs/commercial-excluded-date-range/commercial-excluded-date-range.component";
import { CommercialPolicyEditComponent } from "./dialogs/commercial-policy-edit/commercial-policy-edit.component";

@NgModule({
	declarations: [
		CommercialLinesContainerComponent,
		CLPolicyDetailsComponent,
		CLParticipantDetailsComponent,
		CLPolicyActionsComponent,
		CLParticipantActionsComponent,
		ClExcludeDateRangeComponent,
		ClExcludeDateRangeEditComponent,
		ClReplaceDeviceComponent,
		ClViewTripsComponent,
		ClParticipantHistoryComponent,
		ClConnectionTimelineComponent,
		ClExcludedDateRangeComponent,
		CommercialPolicyEditComponent
	],
	imports: [
		MatDialogModule,
		ReactiveFormsModule,
		CommonModule,
		CoreModule,
		SharedModule,
		CustomerServiceSharedModule,
		MatDatepickerModule,
		MatFormFieldModule
	],
	exports: [
		CommercialLinesContainerComponent,
		CLParticipantDetailsComponent,
		CLPolicyDetailsComponent,
		CLPolicyActionsComponent,
		CLParticipantActionsComponent,
		MatFormFieldModule,
		MatIcon
	],
	providers: [
		CommercialPolicyService,
		CommercialParticipantService,
		CommercialPolicyQuery,
		MatDialogModule,
	]

})
export class CommercialLinesModule { }
