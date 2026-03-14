import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { UserInfoEditorComponent } from "./components/user-info-editor/user-info-editor.component";
import { DebugToolsRoutingModule } from "./debug-routing";
import { InputControlsComponent } from "./components/input-controls/input-controls.component";
import { DateOptionsComponent } from "./components/input-controls/date-options/date-options.component";
import { CommonOptionsComponent } from "./components/input-controls/common-options/common-options.component";
import { TextOptionsComponent } from "./components/input-controls/text-options/text-options.component";
import { NumericOptionsComponent } from "./components/input-controls/numeric-options/numeric-options.component";

@NgModule({
	declarations: [
		UserInfoEditorComponent,
		InputControlsComponent,
		DateOptionsComponent,
		CommonOptionsComponent,
		TextOptionsComponent,
		NumericOptionsComponent
	],
	imports: [
		CommonModule,
		DebugToolsRoutingModule,
		CoreModule,
		SharedModule
	]
})
export class DebugToolsModule { }
