import { autoSpy } from "autoSpy";
import { MobileNumberEditComponent } from "./mobile-number-edit.component";
import { PhoneNumberPipe } from "@modules/shared/pipes/phoneNumber.pipe";

function setup() {
	const injectedData = {};
	var pipe = autoSpy(PhoneNumberPipe);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new MobileNumberEditComponent(injectedData, pipe);
		}
	};

	return builder;
}

describe("MobileNumberEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
