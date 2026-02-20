import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { ApiService } from "@modules/core/services/api/api.service";
import { IncidentResolution, SPParameter } from "@modules/shared/data/resources";
import { BehaviorSubject, Observable, OperatorFunction } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class IncidentResolutionService {

	private readonly controller = "/tools/incidentResolution";

	private incidentResolutions: BehaviorSubject<IncidentResolution[]> = new BehaviorSubject<IncidentResolution[]>(undefined);
	incidentResolutions$: Observable<IncidentResolution[]> = this.incidentResolutions.asObservable();

	constructor(private api: ApiService, private datePipe: DatePipe) { }

	get(): Observable<IncidentResolution[]> {
		return this.api.get<IncidentResolution[]>({
			uri: this.controller
		}).pipe(tap(x => this.incidentResolutions.next(x)));
	}

	getStoredProcedureParameters(storedProcedureName: string): Observable<SPParameter[]> {
		return this.api.get<SPParameter[]>({
			uri: `${this.controller}/getStoredProcedureParameters/${storedProcedureName}`
		});
	}

	add(incidentResolution: IncidentResolution): Observable<any> {
		return this.api.post<any>({
			uri: this.controller,
			payload: incidentResolution
		}).pipe(this.refreshIncidentResolutions());
	}

	edit(incidentResolution: IncidentResolution): Observable<any> {
		return this.api.put<any>({
			uri: this.controller,
			payload: incidentResolution
		}).pipe(this.refreshIncidentResolutions());
	}

	delete(incidentResolution: IncidentResolution): Observable<any> {
		return this.api.delete<any>({
			uri: this.controller,
			payload: incidentResolution
		}).pipe(this.refreshIncidentResolutions());
	}

	execute(incidentResolution: IncidentResolution, storedProcedureParameters: SPParameter[]): Observable<any> {
		storedProcedureParameters.forEach(x => x.value = x.dataType.toLowerCase().includes("date") ?
			this.datePipe.transform(x.value, "yyyy-MM-dd hh:mm:ss") : x.value.toString());

		storedProcedureParameters.forEach(x => x.value = (x.name.toLowerCase().includes("phone") || x.name.toLowerCase().includes("mobile")) ?
			x.value.replace(/[()\-\s]+/g, "") : x.value.toString());

		return this.api.post<any>({
			uri: `${this.controller}/execute`,
			payload: { incidentResolution, storedProcedureParameters }
		});
	}

	private refreshIncidentResolutions(): OperatorFunction<any, any> {
		return concatMap(x => this.get().pipe(map(_ => x)));
	}
}
