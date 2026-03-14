import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { UserInfoEditorComponent } from "./components/user-info-editor/user-info-editor.component";

import { AppName } from "./metadata";
import { InputControlsComponent } from "./components/input-controls/input-controls.component";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.UserInfoEditor },
			{ path: AppName.UserInfoEditor, component: UserInfoEditorComponent },
			{ path: AppName.InputControlTest, component: InputControlsComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DebugToolsRoutingModule { }
