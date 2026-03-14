import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
// import { CommercialLinesModule } from "./commercial-lines/commercial-lines.module";
import { CustomerServiceRoutingModule } from "./customer-service-routing.module";
import { PolicyHistoryModule } from "./tools/policy-history/policy-history.module";
import { CustomerServiceSnapshotModule } from "./snapshot/snapshot.module";
import { CustomerServiceTrialModule } from "./trial/cs-trial.module";
import { DeviceHistoryModule } from "./tools/device-history/device-history.module";
import { EligibleZipCodesModule } from "./tools/eligible-zip-codes/eligible-zip-codes.module";
import { IneligibleVehiclesModule } from "./tools/ineligible-vehicles/ineligible-vehicles.module";
import { IncidentResolutionModule } from "./tools/incident-resolution/incident-resolution.module";
import { AreModule } from "./are/are.module";

@NgModule({
	imports: [
		CommonModule,
		CustomerServiceRoutingModule,
		CoreModule,
		SharedModule,
		AreModule,
		// CommercialLinesModule,
		CustomerServiceSnapshotModule,
		CustomerServiceTrialModule,
		DeviceHistoryModule,
		EligibleZipCodesModule,
		IncidentResolutionModule,
		IneligibleVehiclesModule,
		PolicyHistoryModule
	],
	providers: []
})
export class CustomerServiceModule { }
