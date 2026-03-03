import { EnumService, UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { OptOutSuspensionEditComponent } from "./opt-out-suspension-edit.component";

function setup() {
	const injectedData = {};
	const enums = autoSpy(EnumService);
	const user = autoSpy(UserInfoService);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new OptOutSuspensionEditComponent(injectedData, enums, user);
		}
	};

	return builder;
}

describe("OptOutSuspensionEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
