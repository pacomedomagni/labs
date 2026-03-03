import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CoreModule } from "@modules/core/core.module";
import { SharedModule } from "@modules/shared/shared.module";
import { IncidentResolutionRoutingModule } from "./incident-resolution-routing.module";
import { IncidentResolutionService } from "./services/incident-resolution.service";
import { IncidentResolutionComponent, IncidentResolutionEditComponent } from "./components";
import { StoredProcedureParmInputComponent } from "./components/stored-procedure-parm-input/stored-procedure-parm-input.component";

@NgModule({
	declarations: [
		IncidentResolutionComponent,
		IncidentResolutionEditComponent,
		StoredProcedureParmInputComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		IncidentResolutionRoutingModule,
	],
	providers: [
		IncidentResolutionService,
	]
})
export class IncidentResolutionModule { }
