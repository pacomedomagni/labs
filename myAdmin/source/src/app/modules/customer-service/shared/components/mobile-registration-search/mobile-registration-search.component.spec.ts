import { Participant, Policy } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of, throwError } from "rxjs";
import { PolicyService } from "@modules/customer-service/shared/services/policy.service";
import { MobileRegistrationSearchComponent } from "./mobile-registration-search.component";

function setup() {
	const policyService = autoSpy(PolicyService);

	const builder = {
		policyService,
		default() {
			return builder;
		},
		build() {
			return new MobileRegistrationSearchComponent(policyService);
		}
	};

	return builder;
}

describe("MobileRegistrationSearchComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should have correct initial state", () => {
		const { build } = setup().default();
		const component = build();

		expect(component.policyNumber).toBe("");
		expect(component.hasSearched).toBe(false);
		expect(component.isLoading).toBe(false);
		expect(component.searchedPolicyNumber).toBeNull();
		expect(component.policyFeatures).toBeNull();
		expect(component.results).toEqual([]);
	});

	describe("onPolicySearch", () => {
		it("should call policyService.getPolicy with policy number", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = { participants: [] } as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(policyService.getPolicy).toHaveBeenCalledWith("123456789");
		});

		it("should set searchedPolicyNumber when search is called", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = { participants: [] } as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(component.searchedPolicyNumber).toBe("123456789");
		});

		it("should set hasSearched to true on success", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = { participants: [] } as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(component.hasSearched).toBe(true);
			expect(component.isLoading).toBe(false);
		});

		it("should handle error and clear results", () => {
			const { build, policyService } = setup().default();
			const component = build();

			policyService.getPolicy.mockReturnValue(throwError(() => new Error("API Error")));
			component.onPolicySearch("123456789");

			expect(component.results).toEqual([]);
			expect(component.policyFeatures).toBeNull();
			expect(component.isLoading).toBe(false);
			expect(component.hasSearched).toBe(true);
		});
	});

	describe("mapParticipantsToMobileRegistrations", () => {
		it("should return empty array when participants is null", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = { participants: null } as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(component.results).toEqual([]);
		});

		it("should filter out participants without telematicsId", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = {
				participants: [
					{ telematicsId: "TEL123", areDetails: null, snapshotDetails: null, registrationDetails: null } as unknown as Participant,
					{ telematicsId: "", areDetails: null, snapshotDetails: null, registrationDetails: null } as unknown as Participant,
					{ telematicsId: null, areDetails: null, snapshotDetails: null, registrationDetails: null } as unknown as Participant
				]
			} as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(component.results.length).toBe(1);
			expect(component.results[0].telematicsId).toBe("TEL123");
		});

		it("should map participant data correctly", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = {
				participants: [{
					telematicsId: "TEL123",
					areDetails: { adEnrolled: true },
					snapshotDetails: null,
					registrationDetails: { mobileRegistrationCode: "5551234567", statusSummary: "Active" }
				} as unknown as Participant]
			} as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(component.results[0].telematicsId).toBe("TEL123");
			expect(component.results[0].mobilePhone).toBe("5551234567");
			expect(component.results[0].registrationStatus).toBe("Active");
		});

		it("should default mobilePhone to empty string when registrationDetails is null", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = {
				participants: [{ telematicsId: "TEL123", areDetails: null, snapshotDetails: null, registrationDetails: null } as unknown as Participant]
			} as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");

			expect(component.results[0].mobilePhone).toBe("");
			expect(component.results[0].registrationStatus).toBe("");
		});
	});

	describe("getParticipantFeatures", () => {
		test.each([
			{ homebaseParticipantSummaryResponse: { adEnrolled: true, ubiEnrolled: true }, expected: "AR/UBI" },
			{ homebaseParticipantSummaryResponse: { adEnrolled: true, ubiEnrolled: false }, expected: "AR" },
			{ homebaseParticipantSummaryResponse: { adEnrolled: false, ubiEnrolled: true }, expected: "UBI" },
			{ homebaseParticipantSummaryResponse: { adEnrolled: false, ubiEnrolled: false }, expected: "None" },
			{ homebaseParticipantSummaryResponse: null, expected: "None" }
		])
			("should return correct features when: %s", (data) => {
				const { build, policyService } = setup().default();
				const component = build();
				const mockPolicy = {
					participants: [{
						telematicsId: "TEL123",
						homebaseParticipantSummaryResponse: data.homebaseParticipantSummaryResponse,
						registrationDetails: null
					} as unknown as Participant]
				} as Policy;

				policyService.getPolicy.mockReturnValue(of(mockPolicy));
				component.onPolicySearch("123456789");

				expect(component.results[0].features).toBe(data.expected);
			});
	});

	describe("getPolicyFeatures", () => {
		test.each([
			{ participants: [], expected: null },
			{ participants: null, expected: null },
			{ participants: [{ telematicsId: "1", areDetails: { adEnrolled: true }, snapshotDetails: { ubiEnrolled: true } }], expected: "AR/UBI" },
			{ participants: [{ telematicsId: "1", areDetails: { adEnrolled: true }, snapshotDetails: null }], expected: "AR" },
			{ participants: [{ telematicsId: "1", areDetails: null, snapshotDetails: { ubiEnrolled: true } }], expected: "UBI" },
			{ participants: [{ telematicsId: "1", areDetails: null, snapshotDetails: null }], expected: null },
			{
				participants: [
					{ telematicsId: "1", areDetails: { adEnrolled: true }, snapshotDetails: null },
					{ telematicsId: "2", areDetails: null, snapshotDetails: { ubiEnrolled: true } }
				],
				expected: "AR/UBI"
			}
		])
			("should determine policy features appropriately when: %s", (data) => {
				const { build, policyService } = setup().default();
				const component = build();
				const mockPolicy = { participants: data.participants as unknown as Participant[] } as Policy;

				policyService.getPolicy.mockReturnValue(of(mockPolicy));
				component.onPolicySearch("123456789");

				expect(component.policyFeatures).toBe(data.expected);
			});
	});

	describe("clearSearch", () => {
		it("should reset all state to initial values", () => {
			const { build, policyService } = setup().default();
			const component = build();
			const mockPolicy = {
				participants: [{ telematicsId: "TEL123", areDetails: { adEnrolled: true }, snapshotDetails: null, registrationDetails: null } as unknown as Participant]
			} as Policy;

			policyService.getPolicy.mockReturnValue(of(mockPolicy));
			component.onPolicySearch("123456789");
			component.policyNumber = "123456789";

			component.clearSearch();

			expect(component.policyNumber).toBe("");
			expect(component.hasSearched).toBe(false);
			expect(component.searchedPolicyNumber).toBeNull();
			expect(component.policyFeatures).toBeNull();
			expect(component.results).toEqual([]);
		});
	});
});
