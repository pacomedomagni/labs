import { autoSpy } from "autoSpy";
import { DialogService } from "@pgr-cla/core-ui-components";
import { MatDialog } from "@angular/material/dialog";
import { TransactionLogViewerComponent } from "./transaction-log-viewer.component";

function setup() {
	const injectedData = {
		Data: "" as string
	};

	const dialogService = autoSpy(DialogService);
	const dialog = autoSpy(MatDialog);
	const builder = {
		injectedData,
		dialogService,
		default() {
			return builder;
		},
		build() {
			return new TransactionLogViewerComponent(injectedData, dialog,
				dialogService);
		}
	};

	return builder;
}

describe("TransactionLogViewerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

}
);
