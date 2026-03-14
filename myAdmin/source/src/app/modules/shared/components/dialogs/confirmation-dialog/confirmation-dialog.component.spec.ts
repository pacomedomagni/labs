import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

function setup() {
	const data = {
		cancelText: "",
		confirmText: "",
		message: "",
		title: "",
		subtitle: "",
		hideCancelButton: false,
		alignTextLeft: false,
		helpKey: ""
	};
	const diagRef: any = undefined;

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ConfirmationDialogComponent(data, diagRef);
		}
	};

	return builder;
}

describe("ConfirmationDialogComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
