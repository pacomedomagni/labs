import { ApiService, LoadingService } from "@modules/core/services/_index";
import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { RegistrationDialogService } from "./registration-dialog.service";
import { RegistrationService } from "./registration.service";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));

	const registrationService = autoSpy(RegistrationService);
	const labelService = autoSpy(LabelService);
	const enums = autoSpy(EnumService);
	const dialogService = autoSpy(DialogService);
	const loadingService = autoSpy(LoadingService);
	const notificationService = autoSpy(NotificationService);
	const builder = {
		registrationService,
		labelService,
		enums,
		dialogService,
		loadingService,
		notificationService,
		default() {
			return builder;
		},
		build() {
			return new RegistrationDialogService(registrationService, labelService, enums, dialogService, loadingService, notificationService);
		}
	};

	return builder;
}

describe("RegistrationDialogService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
