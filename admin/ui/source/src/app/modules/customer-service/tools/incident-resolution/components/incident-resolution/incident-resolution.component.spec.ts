import { IncidentResolution, SPParameter } from "@modules/shared/data/resources";
import { DialogService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { IncidentResolutionService } from "../../services/incident-resolution.service";
import { IncidentResolutionEditComponent } from "../incident-resolution-edit/incident-resolution-edit.component";
import { StoredProcedureParmInputComponent } from "../stored-procedure-parm-input/stored-procedure-parm-input.component";
import { IncidentResolutionComponent } from "./incident-resolution.component";

function setup() {
	const incidentResService = autoSpy(IncidentResolutionService);
	incidentResService.add.mockReturnValue(of({}));
	incidentResService.delete.mockReturnValue(of({}));
	incidentResService.edit.mockReturnValue(of({}));
	incidentResService.execute.mockReturnValue(of({}));

	const dialogService = autoSpy(DialogService);
	const notificationService = autoSpy(NotificationService);
	const builder = {
		incidentResService,
		dialogService,
		notificationService,
		default() {
			return builder;
		},
		build() {
			return new IncidentResolutionComponent(incidentResService, dialogService, notificationService);
		}
	};

	return builder;
}

describe("IncidentResolutionComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should create columns", () => {
		const { build } = setup().default();
		const component = build();
		expect(component.columns).toEqual(["kba", "description", "step", "storedProc", "execute"]);
	});

	describe("describe for incident resolution action", () => {
		test.each([
			{ action: "Add" },
			{ action: "Delete" },
			{ action: "Edit" },
			{ action: "Execute", parms: [] },
			{ action: "Execute", parms: [{} as SPParameter] }
		])
			("should perform action appropriately when: %s", (data) => {
				const { build, incidentResService, dialogService, notificationService } = setup().default();
				const component = build();
				const componentTitle = component["title"];
				const modalTitle = `${data.action} ${componentTitle}`;
				const incRes = { kbaId: "1234" } as IncidentResolution;

				incidentResService.getStoredProcedureParameters.mockReturnValueOnce(of(data.parms));

				switch (data.action) {
					case "Execute":
						dialogService.confirmed.mockReturnValue(of(data.parms.length === 0 ? true : data.parms));
						break;
					default:
						dialogService.confirmed.mockReturnValue(of(incRes));
						break;
				}

				component[data.action.toLowerCase()](data.action !== "Add" ? incRes : undefined);

				switch (data.action) {
					case "Add":
						expect(dialogService.openFormDialog).toHaveBeenCalledWith({
							title: modalTitle,
							component: IncidentResolutionEditComponent,
							formModel: {}
						});
						expect(incidentResService.add).toHaveBeenCalledTimes(1);
						break;
					case "Delete":
						expect(dialogService.openConfirmationDialog).toHaveBeenCalledWith({
							title: modalTitle,
							subtitle: incRes.kbaId,
							message: `Are you sure you want to ${data.action} this ${componentTitle}?`
						});
						expect(incidentResService.delete).toHaveBeenCalledWith(incRes);
						break;
					case "Edit":
						expect(dialogService.openFormDialog).toHaveBeenCalledWith({
							title: modalTitle,
							component: IncidentResolutionEditComponent,
							formModel: incRes
						});
						expect(incidentResService.edit).toHaveBeenCalledWith(incRes);
						break;
					case "Execute":
						if (data.parms.length === 0) {
							expect(dialogService.openConfirmationDialog).toHaveBeenCalledWith({
								title: modalTitle,
								subtitle: incRes.kbaId,
								message: `Are you sure you want to ${data.action} this ${componentTitle}?`
							});
							expect(incidentResService.execute).toHaveBeenCalledWith(incRes, []);
						}
						else {
							dialogService.openFormDialog({
								title: modalTitle,
								subtitle: incRes.kbaId,
								component: StoredProcedureParmInputComponent,
								formModel: data.parms
							});
							expect(incidentResService.execute).toHaveBeenCalledWith(incRes, data.parms);
						}
						break;
				}

				expect(notificationService.success).toHaveBeenCalled();
			});
	});

});