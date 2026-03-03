import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { AccidentDetectionService } from "./accident-detection.service";

const controller = "/CustomerService/AccidentDetection";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));
	api.post.mockReturnValue(of());
	api.put.mockReturnValue(of());

	const builder = {
		api,
		default() {
			return builder;
		},
		build() {
			return new AccidentDetectionService(api);
		}
	};

	return builder;
}

describe("AccidentDetectionService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should unenroll participant", () => {
		const { build, api } = setup().default();
		const component = build();
		const telematicsId = "123";
		const unenrollReason = "User Initiated";
		component.unenrollParticipant(telematicsId, unenrollReason);
		expect(api.post).toHaveBeenCalledWith({
			uri: `${controller}/Unenroll`,
			payload: { telematicsId, unenrollReason }
		});
	});

});
