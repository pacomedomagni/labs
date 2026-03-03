import { SimpleChange } from "@angular/core";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { PolicyEnrolledFeatures } from "@modules/shared/data/resources";
import { EnumData } from "@modules/shared/services/enum-service/enum.service";
import { DialogService, EnumService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { mock } from "jest-mock-extended";
import { of } from "rxjs";
import { CrossAppService } from "../../services/cross-app.service";
import { CrossAppQuery } from "../../stores/cross-app-query";
import { CrossAppBannerComponent } from "./cross-app-banner.component";
import { PolicyQuery } from "../../stores/_index";
import { PolicyService } from "../../services/policy.service";

function setup() {
	const policyQuery = autoSpy(PolicyQuery);
	const service = autoSpy(CrossAppService);
	const policyService = autoSpy(PolicyService);
	const query = autoSpy(CrossAppQuery);
	const enumService = autoSpy(EnumService);
	const dialogService = autoSpy(DialogService);
	const builder = {
		policyQuery,
		service,
		policyService,
		query,
		enumService,
		dialogService,
		default() {
			return builder;
		},
		build() {
			return new CrossAppBannerComponent(policyQuery, dialogService, service, policyService, query, enumService);
		}
	};

	return builder;
}

describe("CrossAppBannerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

// 	describe("describe for ngOnChanges", () => {
// 		test.each([
// 			{ policyNumber: "-1", resetQuery: true },
// 			{ policyNumber: null, resetQuery: true },
// 			{ policyNumber: undefined, resetQuery: true },
// 			{ policyNumber: "1", prevPolicyNumber: "1", expectFetch: false },
// 			{ policyNumber: "2", prevPolicyNumber: "1", expectFetch: false }
// 		])
// 			("should execute ngOnChange appropriately when: %s", (data) => {
// 				const { service, query, build } = setup().default();
// 				service.getPolicyEnrolledFeatures.mockReturnValue(of({} as PolicyEnrolledFeatures));
// 				const component = build();

// 				const changes = { policyNumber: new SimpleChange(data.prevPolicyNumber, data.policyNumber, true) };

// 				component.ngOnChanges(changes);

// 				if (data.resetQuery) {
// 					expect(query.updatePolicyEnrolledFeatures).toHaveBeenCalledWith(undefined);
// 				}

// 				if (data.expectFetch) {
// 					expect(service.getPolicyEnrolledFeatures).toHaveBeenCalledWith(data.policyNumber);
// 				}
// 			});
// 	});

// 	describe("describe for cross app banner display", () => {
// 		test.each([
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [{ feature: TelematicsFeatures.Snapshot }]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: []
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [{ feature: TelematicsFeatures.Snapshot }]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: []
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [{ feature: TelematicsFeatures.AccidentDetection }]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: [{ feature: TelematicsFeatures.AccidentDetection }]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: []
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: []
// 			}
// 		])
// 			("should display cross app banner appropriately when: %s", (data) => {
// 				const { query, enumService, build } = setup().default();
// 				query.policyEnrolledFeatures$ = of(data.policyFeatures);
// 				data.expected.forEach(x => x["label"] = x.feature === TelematicsFeatures.Snapshot ? "Snapshot" : "Accident Response");
// 				let enumMock = mock<EnumData<TelematicsFeatures>>();
// 				(enumMock.description as jest.Mock).mockImplementation((feature: TelematicsFeatures) => feature === TelematicsFeatures.Snapshot ? "Snapshot" : "Accident Response");
// 				enumService.telematicsFeatures = enumMock;
// 				const component = build();
// 				component.currentFeature = data.currentFeature;

// 				component.ngOnInit();

// 				expect(component.availableFeatures).toEqual(data.expected);
// 			});
// 	});

 });
