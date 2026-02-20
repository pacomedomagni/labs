import { BehaviorSubject, Observable } from "rxjs";

import { DeviceLot } from "@modules/shared/data/resources";
import { Injectable } from "@angular/core";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { tap } from "rxjs/operators";

@Injectable()
export class DevicePrepReceivedQuery extends ResourceQuery {

	private lots: BehaviorSubject<DeviceLot[]> = new BehaviorSubject<DeviceLot[]>(undefined);
	public lots$: Observable<DeviceLot[]> = this.lots.asObservable().pipe(tap(x => this.updateSearchError(x)));

	constructor() { super(); }

	updateLots(lots: DeviceLot[]): void {
		this.lots.next(lots);
	}
}
