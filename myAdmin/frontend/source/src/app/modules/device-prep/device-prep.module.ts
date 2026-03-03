import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { DevicePrepRoutingModule } from "./device-prep-routing.module";
import { DevicePrepActivationModule } from "./activation/activation.module";
import { DevicePrepReceivedModule } from "./received/received.module";
import { DevicePrepBenchTestModule } from "./bench-test/bench-test.module";

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		DevicePrepRoutingModule,
		CoreModule,
		SharedModule,
		DevicePrepActivationModule,
		DevicePrepReceivedModule,
		DevicePrepBenchTestModule
	],
	providers: []
})
export class DevicePrepModule { }
