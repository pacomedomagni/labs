import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CoreModule } from "@modules/core/core.module";
import { SharedModule } from "@modules/shared/shared.module";
import { IneligibleVehiclesRoutingModule } from "./ineligible-vehicles-routing.module";
import { IneligibleVehiclesComponent } from "./components/_index";
import { IneligibleVehiclesService } from "./services/ineligible-vehicles.service";

@NgModule({
	declarations: [
		IneligibleVehiclesComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		IneligibleVehiclesRoutingModule,
	],
	providers: [
		IneligibleVehiclesService,
	]
})
export class IneligibleVehiclesModule { }
