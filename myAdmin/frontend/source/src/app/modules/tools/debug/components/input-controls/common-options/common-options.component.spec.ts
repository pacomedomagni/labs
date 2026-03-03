import { CommonOptionsComponent } from "./common-options.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new CommonOptionsComponent();
		}
	};

	return builder;
}

describe("CommonOptionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
