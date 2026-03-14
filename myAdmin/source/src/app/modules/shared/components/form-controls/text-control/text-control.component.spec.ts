import { TextControlComponent } from "../_index";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new TextControlComponent();
		}
	};

	return builder;
}

describe("TextControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
