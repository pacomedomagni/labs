import { ControlTypes } from "@modules/shared/data/control-types";
import { SPParameter } from "@modules/shared/data/resources";
import { UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { StoredProcedureParmInputComponent } from "./stored-procedure-parm-input.component";

function setup() {
	const injectedData = [];
	const userInfoService = autoSpy(UserInfoService);
	const builder = {
		injectedData,
		userInfoService,
		default() {
			return builder;
		},
		build() {
			return new StoredProcedureParmInputComponent(injectedData, userInfoService);
		}
	};

	return builder;
}

describe("StoredProcedureParmInputComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should adjust label", () => {
		const { build } = setup().default();
		const component = build();
		const sp = { name: "@Parm_Test" } as SPParameter;

		const label = component.getLabel(sp);

		expect(label).toEqual("Test");
	});

	describe("control identification", () => {
		test.each([
			{ controlType: ["char", "varchar", "tinytext", "text", "mediumtext", "longtext"], type: ControlTypes.Text },
			{ controlType: ["tinyint", "smallint", "mediumint", "bigint", "integer", "float", "double", "decimal"], type: ControlTypes.Numeric },
			{ controlType: ["date", "datetime"], type: ControlTypes.DateTime },
			{ controlType: ["uniqueidentifier"], type: ControlTypes.Guid }
		])
			("should identify control appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();
				let method;

				switch (data.type) {
					case ControlTypes.Text:
						method = "isTextControl";
						break;
					case ControlTypes.Numeric:
						method = "isNumericControl";
						break;
					case ControlTypes.DateTime:
						method = "isDateControl";
						break;
					case ControlTypes.Guid:
						method = "isGuidControl";
						break;
				}

				data.controlType.forEach(x => {
					expect(component[method](x)).toEqual(true);
				});
			});
	});

});
