import { SelectControlComponent } from "../_index";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new SelectControlComponent();
		}
	};

	return builder;
}

describe("SelectControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
