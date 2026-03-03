import { NotificationService } from "@pgr-cla/core-ui-components";
import { UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { UserInfoEditorComponent } from "./user-info-editor.component";

function setup() {
	const userInfoService = autoSpy(UserInfoService);
	const notificationService = autoSpy(NotificationService);
	const builder = {
		userInfoService,
		notificationService,
		default() {
			return builder;
		},
		build() {
			return new UserInfoEditorComponent(userInfoService, notificationService);
		}
	};

	return builder;
}

describe("UserInfoEditorComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
