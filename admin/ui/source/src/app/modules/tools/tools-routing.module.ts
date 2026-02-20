import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { AppName as tools, userInfoMetadata, inputControlTestMetadata } from "./debug/metadata";
import { UserInfoEditorComponent } from "./debug/components/user-info-editor/user-info-editor.component";
import { InputControlsComponent } from "./debug/components/input-controls/input-controls.component";

const routes: Routes = [
	{
		path: "",
		children: [
			{
				path: "",
				pathMatch: "full",
				redirectTo: "Apps"
			},
			{
				path: "Apps",
				children: [
					{
						path: "",
						redirectTo: tools.UserInfoEditor
					},
					{
						data: { breadcrumb: userInfoMetadata.name },
						path: tools.UserInfoEditor,
						component: UserInfoEditorComponent
					},
					{
						data: { breadcrumb: inputControlTestMetadata.name },
						path: tools.InputControlTest,
						component: InputControlsComponent
					}
				]
			}
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ToolsRoutingModule { }
