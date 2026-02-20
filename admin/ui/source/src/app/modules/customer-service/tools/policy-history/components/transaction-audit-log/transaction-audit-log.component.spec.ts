import { autoSpy } from "autoSpy";
import { MatDialog } from "@angular/material/dialog";
import { DialogService } from "@modules/shared/services/_index";
import { TransactionAuditLogComponent } from "./transaction-audit-log.component";

function setup() {
	const matDialog = autoSpy(MatDialog);
	const dialogService = autoSpy(DialogService);

	const builder = {
		matDialog,
		dialogService,
		default() {
			return builder;
		},
		build() {
			return new TransactionAuditLogComponent(matDialog,
				dialogService);
		}
	};
	return builder;
}

describe("TransactionAuditLogComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
