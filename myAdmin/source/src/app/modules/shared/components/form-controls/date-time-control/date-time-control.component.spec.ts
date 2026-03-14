import { DatePipe } from "@angular/common";
import { autoSpy } from "autoSpy";
import { DateTimeControlComponent } from "../_index";

function setup() {
	const datePipe = autoSpy(DatePipe);
	const builder = {
		datePipe,
		default() {
			return builder;
		},
		build() {
			return new DateTimeControlComponent(datePipe);
		}
	};

	return builder;
}

describe("DateTimeControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
