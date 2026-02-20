import { DialogService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { HelpTextComponent } from "./help-text.component";

function setup() {
	const dialog = autoSpy(DialogService);

	const builder = {
		dialog,
		default() {
			return builder;
		},
		build() {
			return new HelpTextComponent(dialog);
		}
	};

	return builder;
}

describe("HelpTextComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
