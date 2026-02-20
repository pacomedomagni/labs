import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { ExternalRedirectGuard } from "@modules/shared/guards/external-redirect.guard";
import { PortalContainerComponent } from "./components/container/container.component";

const routes: Routes = [
	{
		path: "", component: PortalContainerComponent,
		canActivate: [ExternalRedirectGuard]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PortalRoutingModule { }
