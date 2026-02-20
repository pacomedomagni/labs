import { DatePipe } from "@angular/common";
import { autoSpy } from "autoSpy";
import { DateControlComponent } from "../_index";

function setup() {
	const datePipe = autoSpy(DatePipe);
	const builder = {
		datePipe,
		default() {
			return builder;
		},
		build() {
			return new DateControlComponent(datePipe);
		}
	};

	return builder;
}

describe("DateControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
