import { DataSource } from "@angular/cdk/collections";
import { IneligibleVehicle } from "@modules/shared/data/resources";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { IneligibleVehiclesService } from "./ineligible-vehicles.service";

export class IneligibleVehiclesDataSource implements DataSource<IneligibleVehicle> {

	private dataSubject = new BehaviorSubject<IneligibleVehicle[]>([]);
	private loadingSubject = new BehaviorSubject<boolean>(false);
	private totalRecordsSubject = new BehaviorSubject<number>(undefined);

	public loading$ = this.loadingSubject.asObservable();
	public totalRecords$ = this.totalRecordsSubject.asObservable();

	constructor(private service: IneligibleVehiclesService) { }

	loadData(
		pageIndex: number = 0,
		pageSize: number = 50,
		vehicleYear?: number,
		vehicleMake?: string,
		vehicleModel?: string): void {

		this.loadingSubject.next(true);

		this.service.getIneligibleVehicles(pageIndex, pageSize, vehicleYear, vehicleMake, vehicleModel).pipe(
			catchError(() => of([])),
			finalize(() => this.loadingSubject.next(false))
		).subscribe(x => {
			this.totalRecordsSubject.next(JSON.parse(x.headers.get("x-pagination")).totalCount);
			this.dataSubject.next(x.body as IneligibleVehicle[]);
		});
	}

	connect(): Observable<IneligibleVehicle[]> {
		return this.dataSubject.asObservable();
	}

	disconnect(): void {
		this.dataSubject.complete();
		this.loadingSubject.complete();
	}

}
