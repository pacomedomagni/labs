import { DatePipe } from "@angular/common";
import { fakeAsync, tick } from "@angular/core/testing";
import { ApiService } from "@modules/core/services/_index";
import { IncidentResolution, SPParameter } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { IncidentResolutionService } from "./incident-resolution.service";

const behaviorSubject = "incidentResolutions";

function setup() {
	const apiService = autoSpy(ApiService);
	const datePipe = autoSpy(DatePipe);
	const builder = {
		apiService,
		datePipe,
		default() {
			return builder;
		},
		build() {
			return new IncidentResolutionService(apiService, datePipe);
		}
	};

	return builder;
}

describe("IncidentResolutionService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const service = build();
		expect(service).toBeTruthy();
	});

	it("should get", fakeAsync(() => {
		const { build, apiService } = setup().default();
		const service = build();
		const data = [{ kbaId: "1234" } as IncidentResolution];
		apiService.get.mockReturnValue(of(data));

		service.get().subscribe(x => {
			expect(apiService.get).toHaveBeenCalledWith({ uri: service["controller"] });
			expect(x).toEqual(data);
			expect(service[behaviorSubject].value).toEqual(data);
		});

		tick();
	}));

	it("should get stored proc parms", fakeAsync(() => {
		const { build, apiService } = setup().default();
		const service = build();
		const spName = "test";
		const spData = [{ name: "@Parm_Test" } as SPParameter];
		apiService.get.mockReturnValue(of(spData));

		service.getStoredProcedureParameters(spName).subscribe(x => {
			expect(apiService.get).toHaveBeenCalledWith({ uri: `${service["controller"]}/getStoredProcedureParameters/${spName}` });
			expect(x).toEqual(spData);
		});

		tick();
	}));

	it("should add", fakeAsync(() => {
		const { build, apiService } = setup().default();
		const service = build();
		const incRes = { kbaId: "1234" } as IncidentResolution;
		apiService.post.mockReturnValue(of());
		apiService.get.mockReturnValue(of());

		service.add(incRes).subscribe(_ => {
			expect(apiService.post).toHaveBeenCalledWith({ uri: service["controller"], payload: incRes });
			expect(apiService.get).toHaveBeenCalledTimes(1);
		});

		tick();
	}));

	it("should edit", fakeAsync(() => {
		const { build, apiService } = setup().default();
		const service = build();
		const incRes = { kbaId: "1234" } as IncidentResolution;
		apiService.put.mockReturnValue(of());
		apiService.get.mockReturnValue(of());

		service.edit(incRes).subscribe(_ => {
			expect(apiService.put).toHaveBeenCalledWith({ uri: service["controller"], payload: incRes });
			expect(apiService.get).toHaveBeenCalledTimes(1);
		});

		tick();
	}));

	it("should delete", fakeAsync(() => {
		const { build, apiService } = setup().default();
		const service = build();
		const incRes = { kbaId: "1234" } as IncidentResolution;
		apiService.delete.mockReturnValue(of());
		apiService.get.mockReturnValue(of());

		service.delete(incRes).subscribe(_ => {
			expect(apiService.delete).toHaveBeenCalledWith({ uri: service["controller"], payload: incRes });
			expect(apiService.get).toHaveBeenCalledTimes(1);
		});

		tick();
	}));

});
