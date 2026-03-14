import { DialogService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { TripDetailsComponent } from "./trip-details.component";
import { PolicyHistoryService } from "../../../services/policy-history.service";

function setup() {
	const data: any = {};
	const dialog = autoSpy(DialogService);
	const polHistService = autoSpy(PolicyHistoryService);

	const builder = {
		data,
		default() {
			return builder;
		},
		build() {
			return new TripDetailsComponent(data, dialog, polHistService);
		}
	};

	return builder;
}

describe("TripDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
