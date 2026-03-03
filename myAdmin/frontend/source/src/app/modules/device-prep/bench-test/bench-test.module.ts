import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { DeviceBenchtestContainerComponent } from "./components/_index";
import { DevicePrepBenchTestRoutingModule } from "./bench-test-routing";

@NgModule({
	declarations: [
		DeviceBenchtestContainerComponent
	],
	imports: [
		CommonModule,
		DevicePrepBenchTestRoutingModule,
		CoreModule,
		SharedModule
	],
	providers: []
})
export class DevicePrepBenchTestModule { }
