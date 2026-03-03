import { InputControlsComponent } from "./input-controls.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new InputControlsComponent();
		}
	};

	return builder;
}

describe("InputControlsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
