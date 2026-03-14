import { DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { ScoringAlgorithmData, TripEvent } from "@modules/shared/data/resources";
import { DeviceExperience } from "@modules/shared/data/enums";
import { PolicyHistoryService } from "./policy-history.service";

export class TripEventDataSource implements DataSource<TripEvent> {

	private dataSubject = new BehaviorSubject<TripEvent[]>([]);
	private loadingSubject = new BehaviorSubject<boolean>(false);
	private totalRecordsSubject = new BehaviorSubject<number>(undefined);

	public loading$ = this.loadingSubject.asObservable();
	public totalRecords$ = this.totalRecordsSubject.asObservable();

	constructor(private service: PolicyHistoryService) { }

	loadData(
		tripSeqId: number,
		date: Date,
		algorithmData: number,
		experience: DeviceExperience,
		pageIndex: number = 0,
		pageSize: number = 500,
		sortOrder: "asc" | "desc" | "" = "asc",
		filter: string = ""): void {

		this.loadingSubject.next(true);

		this.service.getTripDetails<any>(tripSeqId, date, algorithmData, experience, pageIndex, pageSize, sortOrder, filter, true).pipe(
			catchError(() => of([])),
			finalize(() => this.loadingSubject.next(false))
		).subscribe(x => {
			this.totalRecordsSubject.next(JSON.parse(x.headers.get("x-pagination")).totalCount);
			this.dataSubject.next(x.body as TripEvent[]);
		});
	}

	connect(): Observable<TripEvent[]> {
		return this.dataSubject.asObservable();
	}

	disconnect(): void {
		this.dataSubject.complete();
		this.loadingSubject.complete();
	}

}
