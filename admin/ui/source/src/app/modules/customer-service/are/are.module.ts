import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CoreModule } from "@modules/core/core.module";
import { SharedModule } from "@modules/shared/shared.module";
import { CustomerServiceSharedModule } from "../shared/customer-service-shared.module";
import { AreRoutingModule } from "./are-routing.module";
import {
	AreContainerComponent,
	MultiPolicyDetailsComponent,
	ParticipantActionsComponent,
	ParticipantDetailsComponent,
	PolicyActionsComponent,
	PolicyDetailsComponent
} from "./components/_index";
import { ArePolicyService } from "./services/_index";
import { ArePolicyQuery } from "./stores/_index";

@NgModule({
	declarations: [
		AreContainerComponent,
		MultiPolicyDetailsComponent,
		ParticipantActionsComponent,
		ParticipantDetailsComponent,
		PolicyActionsComponent,
		PolicyDetailsComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		CustomerServiceSharedModule,
		AreRoutingModule,
	],
	providers: [
		ArePolicyService,
		ArePolicyQuery,
	]
})
export class AreModule { }
