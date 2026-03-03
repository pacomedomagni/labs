import { SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { autoSpy } from "autoSpy";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { Policy } from "@modules/shared/data/resources";
import { SnapshotContainerComponent } from "./snapshot-container.component";
import { SnapshotPolicyQuery } from "../../stores/_index";

function setup() {
	const query = autoSpy(SnapshotPolicyQuery);
	query.policySearchHasErrors$ = of(false);
	query.policy$ = of({} as Policy);

	const router = autoSpy(Router);
	Object.defineProperty(router, "events", { value: of([] as Event[]) });
	const snapshotPolicyService = autoSpy(SnapshotPolicyService);
	snapshotPolicyService.getPolicyByDeviceId.mockReturnValue(of({} as Policy));
	snapshotPolicyService.getPolicyByRegistrationCode.mockReturnValue(of([{}] as Policy[]));
	snapshotPolicyService.getPolicy.mockReturnValue(of({} as Policy));

	const builder = {
		query,
		snapshotPolicyService,
		router,
		default() {
			return builder;
		},
		build() {
			return new SnapshotContainerComponent(query, snapshotPolicyService, router);
		}
	};

	return builder;
}

describe("SnapshotContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should search onInit if policy number in route data", () => {
		const { build, snapshotPolicyService } = setup().default();
		const component = build();
		component["routeData"] = { policyNumber: "123" };

		component.ngOnInit();

		expect(snapshotPolicyService.getPolicy).toHaveBeenCalledWith("123");
	});

	it("should search by policy number", () => {
		const { build, snapshotPolicyService } = setup().default();
		const component = build();

		component.searchByPolicyNumber("123");

		expect(snapshotPolicyService.getPolicy).toHaveBeenCalledWith("123");
	});

	it("should search by device serial number", () => {
		const { build, snapshotPolicyService } = setup().default();
		const component = build();

		component.searchBySerialNumber("123");

		expect(snapshotPolicyService.getPolicyByDeviceId).toHaveBeenCalledWith("123");
	});

	it("should search by phone number", () => {
		const { build, snapshotPolicyService } = setup().default();
		const component = build();

		component.searchByPhoneNumber("123");

		expect(snapshotPolicyService.getPolicyByRegistrationCode).toHaveBeenCalledWith("123");
	});

	it("should set error flags appropriately", () => {
		const { build, query } = setup().default();
		query.policySearchHasErrors$ = of(true);
		Object.defineProperty(query, "primaryErrorMessage", { value: "Error Message" });
		const component = build();

		component.ngOnInit();

		expect(component.searchHasErrors).toEqual(true);
		expect(component.searchErrorMessage).toEqual("Error Message");
	});

});
