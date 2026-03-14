import { EmptyStateComponent } from "./empty-state.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new EmptyStateComponent();
		}
	};

	return builder;
}

describe("EmptyStateComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should do nothing when onAction is clicked", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.actionTriggered, "emit").mockImplementation(() => { });

		component.onAction();

		expect(component.actionTriggered.emit).toHaveBeenCalledWith();
	});

});
