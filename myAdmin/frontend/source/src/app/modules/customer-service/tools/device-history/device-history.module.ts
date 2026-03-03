import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CoreModule } from "@modules/core/core.module";
import { SharedModule } from "@modules/shared/shared.module";
import { DeviceHistoryRoutingModule } from "./device-history-routing.module";
import { DeviceHistoryComponent } from "./components/_index";

@NgModule({
	declarations: [
		DeviceHistoryComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		DeviceHistoryRoutingModule
	]
})
export class DeviceHistoryModule { }
