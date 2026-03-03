import { EnumService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { MobileRegistrationStatusSummary } from "@modules/shared/data/enums";
import { Participant, Registration } from "@modules/shared/data/resources";
import { ArePolicyQuery } from "../../stores/_index";
import { ParticipantDetailsComponent } from "./participant-details.component";

function setup() {

	const query = autoSpy(ArePolicyQuery);
	const enumService = autoSpy(EnumService);
	const builder = {
		query,
		default() {
			return builder;
		},
		build() {
			return new ParticipantDetailsComponent(query, enumService);
		}
	};

	return builder;
}

describe("ParticipantDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for isDeviceActive", () => {
		test.each([
			{adEnrolled: true, statusSummary: MobileRegistrationStatusSummary.Complete, consentDateTime: new Date(), expected: true},
			{adEnrolled: false, statusSummary: MobileRegistrationStatusSummary.Complete, consentDateTime: new Date(), expected: false},
			{adEnrolled: true, statusSummary: MobileRegistrationStatusSummary.New, consentDateTime: new Date(), expected: false},
			{adEnrolled: true, statusSummary: MobileRegistrationStatusSummary.Complete, consentDateTime: null, expected: false},
			{adEnrolled: false, statusSummary: MobileRegistrationStatusSummary.New, consentDateTime: null, expected: false}
		])
		("should determine device status appropriately when: %s", (data) => {
			const { build } = setup().default();
			const component = build();

			component.participant = {
				areDetails: {
					adEnrolled: data.adEnrolled,
					accidentResponseConsentDateTime: data.consentDateTime
				}
			} as Participant;
			component.registration = { statusSummary: data.statusSummary } as Registration;
			let result = component.isDeviceActive();

			expect(result).toEqual(data.expected);
		});
	});

	describe("describe for isEnrollmentStatusUnenrolled", () => {
		test.each([
			{adEnrolled: true},
			{adEnrolled: false}
		])
		("should determine enrollment status appropriately when: %s", (data) => {
			const { build } = setup().default();
			const component = build();

			component.participant = {
				areDetails: {
					adEnrolled: data.adEnrolled
				}
			} as Participant;

			let result = component.isEnrollmentStatusUnenrolled();

			expect(result).toEqual(!data.adEnrolled);
		});
	});
});
