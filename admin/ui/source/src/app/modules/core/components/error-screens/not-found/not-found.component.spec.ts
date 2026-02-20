import { NotFoundComponent } from "./not-found.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new NotFoundComponent();
		}
	};
	return builder;
}

describe("NotFoundComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
