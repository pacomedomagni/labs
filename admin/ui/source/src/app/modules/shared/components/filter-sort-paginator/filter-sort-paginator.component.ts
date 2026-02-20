import { AfterViewInit, Component, Input, ViewChild, EventEmitter, Output } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { fromMatPaginator } from "@modules/shared/utils/datasource-utils";
import { BehaviorSubject, Observable, pipe } from "rxjs";
import { MatSort, Sort } from "@angular/material/sort";
import { UIFormats } from "@modules/shared/data/ui-format";
import { ColumnDefinition, FilterSortEvent, FilterType, QueryFilter } from "@modules/shared/data/resources";
import { MatSelectChange } from "@angular/material/select";

@Component({
    selector: "tmx-filter-sort-paginator",
    templateUrl: "./filter-sort-paginator.component.html",
    styleUrls: ["./filter-sort-paginator.component.scss"],
    standalone: false
})
export class FilterSortPaginatorComponent implements AfterViewInit {
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild("tbSort") matSort: MatSort;
	@Input() columnDefinition: ColumnDefinition[];
	@Input() displayedColumns: string[] = [];
	@Input() pageSizeOptions?: number[] = [5, 10, 25, 100];
	@Input() Data: Observable<[]>;
	@Input() totalRows$: Observable<number>;
	@Input() FilterTypes?: FilterType[];
	@Output() GetServerData: EventEmitter<FilterSortEvent> = new EventEmitter<FilterSortEvent>();
	@Output() functionCall: EventEmitter<{ name: string; value: any }> = new EventEmitter<{ name: string; value: any }>();

	data$: BehaviorSubject<[]> = new BehaviorSubject<[]>(null);
	filter$: BehaviorSubject<QueryFilter[]> = new BehaviorSubject<QueryFilter[]>([]);
	displayedRows$: Observable<[]>;
	filterSortEvent: FilterSortEvent = {
		pageEvent:
			{ pageIndex: 0, pageSize: 0, length: 0 },
		filters: [],
		sort: null
	};

	formats = UIFormats;
	items: any;
	currentFilter: string;
	value = "";

	constructor() { }

	public pageChangedEvent(event: PageEvent): PageEvent {
		this.filterSortEvent.pageEvent = event;
		this.GetServerData.emit(this.filterSortEvent);
		return event;
	}

	public getServerData(event: PageEvent, sort: Sort, filters?: QueryFilter): PageEvent {
		this.GetServerData.emit({ pageEvent: event, sort: sort, filters: this.filter$.value });
		return event;
	}

	public addFilter(filter: string, value: string) {
		let currentFilter = this.filter$.value.filter(x => x.property === filter);
		if (currentFilter[0]) {
			currentFilter[0].filter = value;
		}
		else {
			this.filter$.next(
				[...this.filter$.value, {
					property: filter,
					filter: value
				}]
			);
		}
		this.filterSortEvent = {
			...this.filterSortEvent,
			pageEvent: { ...this.filterSortEvent.pageEvent, pageIndex: 0 },
			filters: this.filter$.value
		};
		this.GetServerData.emit(this.filterSortEvent);
	}

	public clearAllFilter(event: Event) {
		this.filter$.next([]);
		this.filterSortEvent = {
			...this.filterSortEvent,
			pageEvent: { ...this.filterSortEvent.pageEvent, pageIndex: 0 },
			filters: []
		};
		this.GetServerData.emit(this.filterSortEvent);
	}

	public clearFilter(filter: QueryFilter) {
		let value = this.filter$.value.filter(x => x.property !== filter.property);
		this.filter$.next(value);
		this.filterSortEvent = { ...this.filterSortEvent, filters: this.filter$.value };
		this.GetServerData.emit(this.filterSortEvent);
	}

	ngAfterViewInit(): void {
		this.matSort.sortChange.subscribe((value) => {
			this.filterSortEvent.pageEvent.pageIndex = 0;
			this.filterSortEvent = { ...this.filterSortEvent, sort: value };
			this.GetServerData.emit(this.filterSortEvent);
		}
		);

		const pageEvents$: Observable<PageEvent> = fromMatPaginator(this.paginator);
		pageEvents$.subscribe(pipe(p => {
			this.filterSortEvent = {
				...this.filterSortEvent,
				pageEvent: p
			};

			this.GetServerData.emit(this.filterSortEvent);
		}
		));

		this.displayedRows$ = this.Data.pipe();
		console.log(this.Data);
	}

	clickFunction(fun: string, value: any) {
		this.functionCall.emit({ name: fun, value: value });
	}

	filterDictionary = new Map<string, string>();

	applyFilter(ob: MatSelectChange, filter: QueryFilter) {

		this.filterDictionary.set(filter.property, ob.value);
		let jsonString = JSON.stringify(Array.from(this.filterDictionary.entries()));

	}

	public isSortingDisabled(column: ColumnDefinition): boolean {
		return !column.sortable;
	}
}

export function sortArrayOfObjects<T>(data: T[],
	keyToSort: string,
	direction: "asc" | "desc" | ""): T[] {
	if (direction === "") {
		return data;
	}
	const compare = (objectA: T, objectB: T) => {
		const valueA = objectA[keyToSort];
		const valueB = objectB[keyToSort];

		if (valueA === valueB) {
			return 0;
		}

		if (valueA > valueB) {
			return direction === "asc" ? 1 : -1;
		} else {
			return direction === "asc" ? -1 : 1;
		}
	};

	return data.slice().sort(compare);
}
