import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { PortalContainerComponent } from "./components/container/container.component";
import { PortalRoutingModule } from "./portal-routing.module";

@NgModule({
	declarations: [
		PortalContainerComponent
	],
	imports: [
		CommonModule,
		PortalRoutingModule,
		CoreModule,
		SharedModule,
	]
})
export class PortalModule { }
