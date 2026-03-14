
import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { DevicePrepActivationQuery } from "./stores/activation-query";
import { DeviceActivationService } from "./services/device-activation.service";
import {
	ActivationSearchComponent,
	DeviceActivationContainerComponent,
	DeviceDetailsComponent
} from "./components/_index";
import { DevicePrepActivationRoutingModule } from "./activation-routing";

@NgModule({
	declarations: [
		DeviceActivationContainerComponent,
		ActivationSearchComponent,
		DeviceDetailsComponent
	],
	imports: [
		CommonModule,
		DevicePrepActivationRoutingModule,
		CoreModule,
		SharedModule,
	],
	providers: [
		DeviceActivationService,
		DevicePrepActivationQuery,
	]
})
export class DevicePrepActivationModule { }
