import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { TrialContainerComponent } from "./components/_index";
import { CustomerServiceTrialRoutingModule } from "./cs-trial-routing";

@NgModule({
	declarations: [
		TrialContainerComponent
	],
	imports: [
		CommonModule,
		CustomerServiceTrialRoutingModule,
		CoreModule,
		SharedModule,
	]
})
export class CustomerServiceTrialModule { }
