import { ApiService } from "@modules/core/services/api/api.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class IneligibleVehiclesService {

	private readonly controller = "/tools/eligibility";

	constructor(private api: ApiService) { }

	getIneligibleVehicles(
		page: number,
		pageSize: number,
		vehicleYear?: number,
		vehicleMake?: string,
		vehicleModel?: string
	): Observable<any> {
		return this.api.post<any>(
			{
				uri: `${this.controller}/ineligibleVehicles?page=${page}&pageSize=${pageSize}`,
				payload: {
					vehicleYear,
					vehicleMake,
					vehicleModel
				},
				options: { fullResponse: true }
			});
	}
}
