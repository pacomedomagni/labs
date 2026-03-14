import { CompatibilityAction, CompatibilityItem } from "@modules/shared/data/resources";

import { EnumService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { DeviceExperience } from "@modules/shared/data/enums";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { CompatibilityEditComponent } from "./compatibility-edit.component";

function setup() {
	const enums = autoSpy(EnumService);
	const query = autoSpy(SnapshotPolicyQuery);
	(query as any).compatibilityActionsMobile = [{ description: "Mobile Action" } as CompatibilityAction];
	(query as any).compatibilityTypesMobile = [{ description: "Mobile Type" } as CompatibilityAction];
	(query as any).compatibilityActionsPlugin = [{ description: "Plugin Action" } as CompatibilityAction];
	(query as any).compatibilityTypesPlugin = [{ description: "Plugin Type" } as CompatibilityAction];

	const injectedData = {} as any;

	const builder = {
		query,
		default() {
			return builder;
		},
		build() {
			return new CompatibilityEditComponent(injectedData, enums, query);
		}
	};

	return builder;
}

describe("CompatibilityEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should filter for mobile", () => {
		const { build, query } = setup().default();
		const component = build();
		component.deviceExperience = DeviceExperience.Mobile;

		component.ngOnInit();

		expect(query.compatibilityActionsMobile).toEqual([{ description: "Mobile Action" } as CompatibilityAction]);
		expect(query.compatibilityTypesMobile).toEqual([{ description: "Mobile Type" } as CompatibilityAction]);
	});

	it("should filter for plugin", () => {
		const { build, query } = setup().default();
		const component = build();
		component.deviceExperience = DeviceExperience.Device;

		component.ngOnInit();

		expect(query.compatibilityActionsPlugin).toEqual([{ description: "Plugin Action" } as CompatibilityAction]);
		expect(query.compatibilityTypesPlugin).toEqual([{ description: "Plugin Type" } as CompatibilityAction]);
	});

	it("should determine if selected (true)", () => {
		const { build } = setup().default();
		const component = build();
		component.model = { compatibilityActionTakenXRef: [{ actionTakenCode: 1 }, { actionTakenCode: 2 }, { actionTakenCode: 3 }] } as CompatibilityItem;

		const result = component.isSelected(1);

		expect(result).toBeTruthy();
	});

	it("should determine if selected (false)", () => {
		const { build } = setup().default();
		const component = build();
		component.model = { compatibilityActionTakenXRef: [{ actionTakenCode: 2 }, { actionTakenCode: 3 }] } as CompatibilityItem;

		const result = component.isSelected(1);

		expect(result).toBeFalsy();
	});

});
