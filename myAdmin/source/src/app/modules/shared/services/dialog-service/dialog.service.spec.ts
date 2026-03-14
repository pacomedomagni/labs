import { MatDialog } from "@angular/material/dialog";
import { autoSpy } from "autoSpy";
import { StaticDataService } from "../static-data/static-data.service";
import { DialogService } from "./dialog.service";

function setup() {
	const dialog = autoSpy(MatDialog);
	const dataService = autoSpy(StaticDataService);

	const builder = {
		dialog,
		dataService,
		default() {
			return builder;
		},
		build() {
			return new DialogService(dialog, dataService);
		}
	};

	return builder;
}

describe("DialogService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
