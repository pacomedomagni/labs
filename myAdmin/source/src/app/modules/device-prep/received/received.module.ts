
import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { DevicePrepReceivedQuery } from "./stores/received-query";
import { DeviceReceivedService } from "./services/device-received.service";
import {
	DeviceReceivedContainerComponent,
	ReceivedDetailsComponent,
	ReceivedSearchComponent,
	StatusMessageComponent
} from "./components/_index";
import { DevicePrepReceivedRoutingModule } from "./received-routing";

@NgModule({
	declarations: [
		DeviceReceivedContainerComponent,
		ReceivedSearchComponent,
		ReceivedDetailsComponent,
		StatusMessageComponent
	],
	imports: [
		CommonModule,
		DevicePrepReceivedRoutingModule,
		CoreModule,
		SharedModule
	],
	providers: [
		DeviceReceivedService,
		DevicePrepReceivedQuery
	]
})
export class DevicePrepReceivedModule { }
