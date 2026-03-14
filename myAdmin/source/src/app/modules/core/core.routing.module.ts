
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NotFoundComponent, TechnicalDifficultyComponent } from "./components/error-screens";

const coreRoutes = [
	{
		path: "invalid-parameters",
		component: TechnicalDifficultyComponent,
		data: {
			title: "Invalid Parameters",
			message: "One or more route or query parameters are missing or invalid."
		}
	},
	{ path: "techdiff", component: TechnicalDifficultyComponent, data: { title: "Technical Difficulty", message: "Uh oh... It looks like something went wrong." } },
	{ path: "**", component: NotFoundComponent, data: { title: "Page Not Found" } }
];

@NgModule({
	imports: [RouterModule.forChild(coreRoutes)],
	exports: [RouterModule]
})
export class CoreRoutingModule { }
