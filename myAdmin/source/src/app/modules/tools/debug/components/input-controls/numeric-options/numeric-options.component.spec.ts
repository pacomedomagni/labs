import { NumericOptionsComponent } from "./numeric-options.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new NumericOptionsComponent();
		}
	};

	return builder;
}

describe("NumericOptionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
