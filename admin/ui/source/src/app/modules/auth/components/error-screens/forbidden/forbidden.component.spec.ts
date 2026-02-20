import { ForbiddenComponent } from "./forbidden.component";

function setup() {
	const builder = {

		default() {
			return builder;
		},
		build() {
			return new ForbiddenComponent();
		}
	};

	return builder;
}

describe("ForbiddenComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();
		expect(component).toBeTruthy();
	});

});
