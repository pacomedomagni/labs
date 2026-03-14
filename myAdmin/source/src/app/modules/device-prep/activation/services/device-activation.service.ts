import { PluginDevice } from "@modules/shared/data/resources";

import { ApiService } from "@modules/core/services/api/api.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { DeviceActivationRequestType } from "@modules/shared/data/enums";
import { DevicePrepActivationQuery } from "../stores/activation-query";

@Injectable({ providedIn: "root" })
export class DeviceActivationService {

	private readonly controller = "/devicePrep/activation";

	constructor(private api: ApiService, private query: DevicePrepActivationQuery) { }

	getDevices(query: string, action: DeviceActivationRequestType): Observable<PluginDevice[]> {
		return this.api.post<PluginDevice[]>({ uri: `${this.controller}/${query}?action=${action}` })
			.pipe(tap(x => this.query.updateDevices(x)));
	}
}
