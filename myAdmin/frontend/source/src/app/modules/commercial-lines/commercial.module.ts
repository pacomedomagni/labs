import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { CustomerServiceSharedModule } from "@modules/customer-service/shared/customer-service-shared.module";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { CommercialPolicyQuery } from "../commercial-lines/policy-search/stores/comm-policy-query";
import { CommercialPolicyService } from "../commercial-lines/policy-search/services/comm-policy.service";
import { CommercialParticipantService } from "../commercial-lines/policy-search/services/participant.service";
import { CommercialLinesModule } from "../../../app/modules/commercial-lines/policy-search/commercial-lines.module";
import { CommercialRoutingModule } from "./commercial-routing.module";

@NgModule({
	declarations: [

	],
	imports: [
		CommonModule,
		CommercialRoutingModule,
		CoreModule,
		SharedModule,
		MatDialogModule,
		ReactiveFormsModule,
		CommonModule,
		CoreModule,
		SharedModule,
		CustomerServiceSharedModule,
		CommercialLinesModule,
		MatDatepickerModule,
		MatFormFieldModule
	],
	exports: [
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
export class CommercialModule { }
