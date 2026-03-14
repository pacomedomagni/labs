import { DeviceLot, Resource } from "@modules/shared/data/resources";
import { Observable, of } from "rxjs";

import { ApiService } from "@modules/core/services/api/api.service";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import { DevicePrepReceivedQuery } from "../stores/received-query";

@Injectable({ providedIn: "root" })
export class DeviceReceivedService {

	private readonly controller = "/devicePrep/received";

	constructor(private api: ApiService, private query: DevicePrepReceivedQuery) { }

	getInProcessLots(): Observable<DeviceLot[]> {
		return this.api.get<DeviceLot[]>({ uri: `${this.controller}/inProcess` })
			.pipe(tap(x => this.query.updateLots(x)));
	}

	findLot(deviceSerialNumber: string): Observable<DeviceLot> {
		return this.api.get<DeviceLot>({ uri: `${this.controller}/findLot/${deviceSerialNumber}` })
			.pipe(tap(x => this.query.updateSearchError(x)));
	}

	checkin(query: string): Observable<Resource> {
		return of({} as Resource);
		// return this.api.post<Resource>({ uri: `${this.controller}/checkIn/${query}` });
	}
}
