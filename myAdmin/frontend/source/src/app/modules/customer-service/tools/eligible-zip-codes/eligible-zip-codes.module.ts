import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedModule } from "@modules/shared/shared.module";
import { CoreModule } from "@modules/core/core.module";
import { EligibleZipCodesRoutingModule } from "./eligible-zip-codes-routing.module";
import { EligibleZipCodesComponent } from "./components/_index";
import { EligibleZipCodesService } from "./services/eligible-zip-codes.service";

@NgModule({
	declarations: [
		EligibleZipCodesComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		EligibleZipCodesRoutingModule,
	],
	providers: [
		EligibleZipCodesService
	]
})
export class EligibleZipCodesModule { }
