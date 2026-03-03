import { PageHeaderComponent } from "./page-header.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new PageHeaderComponent();
		}
	};

	return builder;
}

describe("PageHeaderComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
