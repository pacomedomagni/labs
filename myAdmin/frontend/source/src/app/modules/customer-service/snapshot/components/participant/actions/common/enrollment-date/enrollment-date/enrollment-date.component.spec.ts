import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { Policy } from "@modules/shared/data/resources";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";

import { EnrollmentDateComponent } from "./enrollment-date.component";

const today = getToday();

function setup() {
	const injectedData = {};
	const query = autoSpy(SnapshotPolicyQuery);
	query.policy$ = of({ policyPeriodDetails: [] } as Policy);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new EnrollmentDateComponent(injectedData, query);
		}
	};

	return builder;
}

describe("EnrollmentDateComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for enrollment date pre-check", () => {
		test.each([
			{ futureDate: true, message: "Cannot change Enrollment Date on future dated policy terms", expected: false },
			{ expected: true }
		])
			("should evaluate pre-check appropriately when: %s", (data) => {
				const { build } = setup().default();
				const date = new Date(today);
				if (data.futureDate) {
					date.setDate(today.getDate() + 1);
				}
				else {
					date.setDate(today.getDate());
				}
				const component = build();

				component["runPreChecks"](date);

				expect(component.preCheckCompleted).toEqual(true);
				expect(component.preCheckPassed).toEqual(data.expected);
				expect(component.preCheckError).toEqual(data.message);
			});
	});
});
