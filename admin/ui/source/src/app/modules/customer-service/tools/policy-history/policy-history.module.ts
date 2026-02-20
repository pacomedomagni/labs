
import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import {
	DeviceInfoComponent,
	DeviceInfoMobileComponent,
	ParticipantJunctionComponent,
	ParticipantJunctionDetailsComponent,
	PolicyComponent,
	PolicyHistoryComponent,
	TransactionAuditLogComponent,
	TripDetailsComponent,
	TripEventDetailsComponent
} from "./components/_index";
import { PolicyHistoryService } from "./services/policy-history.service";
import { PolicyHistoryRoutingModule } from "./policy-history-routing.module";

@NgModule({
	declarations: [
		DeviceInfoComponent,
		DeviceInfoMobileComponent,
		ParticipantJunctionComponent,
		ParticipantJunctionDetailsComponent,
		PolicyComponent,
		PolicyHistoryComponent,
		TransactionAuditLogComponent,
		TripDetailsComponent,
		TripEventDetailsComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		PolicyHistoryRoutingModule,
	],
	providers: [
		PolicyHistoryService,
	]
})
export class PolicyHistoryModule { }
