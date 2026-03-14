import { BehaviorSubject, Observable } from "rxjs";
import { PluginDevice } from "@modules/shared/data/resources";

import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { MessageCode } from "@modules/shared/data/enums";

@Injectable()
export class DevicePrepActivationQuery {

	private devices: BehaviorSubject<PluginDevice[]> = new BehaviorSubject<PluginDevice[]>(undefined);
	public devices$: Observable<PluginDevice[]> = this.devices.asObservable();

	private searchError: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
	searchError$: Observable<string> = this.searchError.asObservable();

	deviceSearchHasErrors$: Observable<boolean> = this.devices$.pipe(map(x => {
		const hasError = x === undefined ? false :
			(x[0]?.messages === undefined ? false : x[0]?.messages[MessageCode[MessageCode.Error]] !== undefined);
		if (hasError) {
			this.searchError.next(x[0].messages[MessageCode[MessageCode.Error]]);
		}
		return hasError;
	}));

	constructor() { }

	updateDevices(devices: PluginDevice[]): void {
		this.devices.next(devices);
	}
}
