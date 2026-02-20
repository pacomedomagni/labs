import { AppDataService } from "@modules/shared/services/_index";
import { SideSheetService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { NavRailComponent } from "./nav-rail.component";

function setup(): any {
	const sideSheetService = autoSpy(SideSheetService);
	const dataService = autoSpy(AppDataService);

	const builder = {
		sideSheetService,
		dataService,
		default(): any {
			return builder;
		},
		build(): any {
			return new NavRailComponent(dataService, sideSheetService);
		}
	};

	return builder;
}

describe("NavRailComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
