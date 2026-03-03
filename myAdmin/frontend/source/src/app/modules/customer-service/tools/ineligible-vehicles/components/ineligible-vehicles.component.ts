import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { isKeyAlphaNumeric, isKeyBackspaceOrDelete } from "@modules/shared/utils/keyboard-utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { fromEvent, merge } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, tap } from "rxjs/operators";
import { HelpText } from "../metadata";
import { IneligibleVehiclesDataSource } from "../services/ineligible-vehicles-data-source";
import { IneligibleVehiclesService } from "../services/ineligible-vehicles.service";

@UntilDestroy()
@Component({
    selector: "tmx-ineligible-vehicles",
    templateUrl: "./ineligible-vehicles.component.html",
    styleUrls: ["./ineligible-vehicles.component.scss"],
    standalone: false
})
export class IneligibleVehiclesComponent implements OnInit, AfterViewInit {

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChildren("filter") inputFilters: QueryList<ElementRef>;

	help = HelpText;
	yearFilter: number;
	makeFilter: string;
	modelFilter: string;
	dataSource: IneligibleVehiclesDataSource;
	columns: string[] = ["make", "model", "year", "exclMake", "exactMatch"];
	paginatorHeader: string[] = ["paginatorHeader"];

	constructor(private ineligibleVehiclesService: IneligibleVehiclesService) { }

	ngOnInit(): void {
		this.dataSource = new IneligibleVehiclesDataSource(this.ineligibleVehiclesService);
		this.dataSource.loadData();
	}

	ngAfterViewInit(): void {
		// this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		// merge(this.sort.sortChange, this.paginator.page).pipe(tap(() => this.loadData())).subscribe();

		merge(this.paginator.page).pipe(
			untilDestroyed(this),
			tap(() => this.loadData())).subscribe();

		this.inputFilters.forEach(x => {
			fromEvent(x.nativeElement, "keyup")
				.pipe(
					untilDestroyed(this),
					debounceTime(500),
					filter((e: KeyboardEvent) => isKeyAlphaNumeric(e) || isKeyBackspaceOrDelete(e)),
					distinctUntilChanged(),
					tap(() => {
						this.paginator.pageIndex = 0;
						this.loadData();
					})
				).subscribe();
		});
	}

	private loadData(): void {
		this.dataSource.loadData(
			this.paginator.pageIndex,
			this.paginator.pageSize,
			this.yearFilter,
			this.makeFilter,
			this.modelFilter);
	}

}
