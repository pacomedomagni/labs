import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { EnumService } from "@modules/shared/services/_index";
import { TelematicsFeatures } from "@modules/shared/data/enums";
import { PolicyEnrolledFeatures } from "@modules/shared/data/resources";
import { mock } from "jest-mock-extended";
import { EnumData } from "@modules/shared/services/enum-service/enum.service";
import { CrossAppQuery } from "../stores/cross-app-query";
import { CrossAppService } from "./cross-app.service";

function setup() {
	const api = autoSpy(ApiService);
	const enumService = autoSpy(EnumService);
	const query = autoSpy(CrossAppQuery);
	api.get.mockReturnValue(of({}));

	const builder = {
		api,
		query,
		enumService,
		default() {
			return builder;
		},
		build() {
			return new CrossAppService(api, query, enumService);
		}
	};

	return builder;
}

describe("CrossAppService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should call api to get cross app info for policy", () => {
		const { build, api } = setup().default();
		const component = build();

		component.getPolicyEnrolledFeatures("123").subscribe();

		expect(api.get).toHaveBeenCalledWith({ uri: "/CustomerService/CrossApp/enrolledFeatures/123" });
	});

// 	describe("describe for cross app menu display", () => {
// 		const routerLinkBase = "/CustomerService/Apps";
// 		test.each([
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.AccidentDetection}`, isDisabled: true, display: "Accident Response (Current)" },
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.Snapshot}`, isDisabled: false, display: "Snapshot" }
// 				]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: [
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.AccidentDetection}`, isDisabled: true, display: "Accident Response (Current)" }
// 				]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.Snapshot}`, isDisabled: false, display: "Snapshot" }
// 				]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.AccidentDetection,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: []
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.AccidentDetection}`, isDisabled: false, display: "Accident Response" },
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.Snapshot}`, isDisabled: true, display: "Snapshot (Current)" }
// 				]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: true, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: [
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.AccidentDetection}`, isDisabled: false, display: "Accident Response" }
// 				]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: true } as PolicyEnrolledFeatures,
// 				expected: [
// 					{ routerLink: `${routerLinkBase}/${TelematicsFeatures.Snapshot}`, isDisabled: true, display: "Snapshot (Current)" }
// 				]
// 			},
// 			{
// 				currentFeature: TelematicsFeatures.Snapshot,
// 				policyFeatures: { isEnrolledInAre: false, isEnrolledInSnapshot: false } as PolicyEnrolledFeatures,
// 				expected: []
// 			}
// 		])
// 			("should display cross app menu appropriately when: %s", (data) => {
// 				const { query, enumService, build } = setup().default();
// 				query.policyEnrolledFeatures$ = of(data.policyFeatures);
// 				let enumMock = mock<EnumData<TelematicsFeatures>>();
// 				(enumMock.description as jest.Mock).mockImplementation((feature: TelematicsFeatures) => feature === TelematicsFeatures.Snapshot ? "Snapshot" : "Accident Response");
// 				enumService.telematicsFeatures = enumMock;
// 				const component = build();

// 				const results = component.getAvailableFeaturesMenuData(data.currentFeature, data.policyFeatures);

// 				expect(results).toEqual(data.expected);
// 			});
// 	});
 });
