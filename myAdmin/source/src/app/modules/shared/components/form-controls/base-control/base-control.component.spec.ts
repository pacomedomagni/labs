import { BaseControlComponent } from "../_index";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new BaseControlComponent();
		}
	};

	return builder;
}

describe("BaseControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
