import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { ToolsRoutingModule } from "./tools-routing.module";
import { DebugToolsModule } from "./debug/debug.module";

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		ToolsRoutingModule,
		CoreModule,
		SharedModule,
		DebugToolsModule
	]
})
export class ToolsModule { }
