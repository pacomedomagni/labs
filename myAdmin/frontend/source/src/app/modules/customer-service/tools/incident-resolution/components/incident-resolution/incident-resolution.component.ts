import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { IncidentResolution, SPParameter } from "@modules/shared/data/resources";
import { DialogService } from "@modules/shared/services/_index";
import { isKeyAlphaNumeric, isKeyBackspaceOrDelete } from "@modules/shared/utils/keyboard-utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { fromEvent, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, tap } from "rxjs/operators";
import { IncidentResolutionService } from "../../services/incident-resolution.service";
import { IncidentResolutionEditComponent } from "../incident-resolution-edit/incident-resolution-edit.component";
import { StoredProcedureParmInputComponent } from "../stored-procedure-parm-input/stored-procedure-parm-input.component";

@UntilDestroy()
@Component({
    selector: "tmx-incident-resolution",
    templateUrl: "./incident-resolution.component.html",
    styleUrls: ["./incident-resolution.component.scss"],
    standalone: false
})
export class IncidentResolutionComponent implements OnInit, AfterViewInit {

	@ViewChildren("filter") inputFilters: QueryList<ElementRef>;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	dataSource: MatTableDataSource<IncidentResolution> = new MatTableDataSource([]);
	columns = ["kba", "description", "step", "storedProc", "execute"];
	kbaFilter = "";

	private currIndex: number;
	get currentIndex(): number {
		return this.currIndex;
	}
	set currentIndex(value: number) {
		this.currIndex = value;
	}

	private selItem: IncidentResolution;
	get selectedItem(): IncidentResolution {
		return this.selItem;
	}
	set selectedItem(value: IncidentResolution) {
		this.selItem = value;
	}

	private title = "Incident Resolution";

	constructor(private incidentResService: IncidentResolutionService, private dialogService: DialogService, private notificationService: NotificationService) { }

	/* tslint:disable:no-shadowed-variable */
	ngOnInit(): void {
		this.incidentResService.incidentResolutions$.pipe(untilDestroyed(this)).subscribe(x => {
			this.dataSource.data = x ?? [];
			this.dataSource.filterPredicate = (data: IncidentResolution, filtr: string) => data.kbaId.toLowerCase().includes(filtr.trim().toLowerCase());
		});
		this.incidentResService.get().subscribe();
	}
	/* tslint:enable:no-shadowed-variable */

	ngAfterViewInit(): void {
		this.dataSource.paginator = this.paginator;
		this.inputFilters.forEach(x => {
			fromEvent(x.nativeElement, "keyup")
				.pipe(
					untilDestroyed(this),
					debounceTime(500),
					filter((e: KeyboardEvent) => isKeyAlphaNumeric(e) || isKeyBackspaceOrDelete(e)),
					distinctUntilChanged(),
					tap(() => {
						this.dataSource.filter = this.kbaFilter;
					})
				).subscribe();
		});
	}

	setCurrentItem(index: number, incidentResolution: IncidentResolution): void {
		this.currentIndex = index;
		this.selectedItem = incidentResolution;
	}

	isRowSelected(): boolean {
		return this.currentIndex !== undefined;
	}

	add(): void {
		this.performAction("Add", x => this.incidentResService.add(x));
	}

	edit(incidentResolution: IncidentResolution): void {
		this.performAction("Edit", x => this.incidentResService.edit(x), incidentResolution);
	}

	delete(incidentResolution: IncidentResolution): void {
		this.performAction("Delete", x => this.incidentResService.delete(x), incidentResolution);
	}

	execute(incidentResolution: IncidentResolution): void {
		const action = "Execute";
		this.incidentResService.getStoredProcedureParameters(incidentResolution.storedProcedureName).subscribe(x => {
			if (x?.length === 0) {
				this.dialogService.openConfirmationDialog({
					title: `${action} ${this.title}`,
					subtitle: incidentResolution.kbaId,
					message: `Are you sure you want to ${action} this ${this.title}?`
				});
			}
			else {
				this.dialogService.openFormDialog({
					title: `${action} ${this.title}`,
					subtitle: incidentResolution.kbaId,
					component: StoredProcedureParmInputComponent,
					formModel: x
				});
			}

			this.dialogService.confirmed<boolean | SPParameter[]>().subscribe(y => {
				if (y) {
					this.incidentResService.execute(incidentResolution, y === true ? [] : y)
						.subscribe(r => {
							if (r.responseErrors?.length > 0 ) {
								this.notificationService.error(`Sorry, your transaction could not be processed.\n\nMessage: ${r.responseErrors[0].message}`);
							}
							else {
								this.notificationService.success(`${action} ${this.title} Successful`);
							}
						});
				}
			});
		});

	}

	private performAction(action: string, apiCall: (incRes: IncidentResolution) => Observable<any>, incidentResolution?: IncidentResolution): void {
		incidentResolution = incidentResolution === undefined ? {} as IncidentResolution : incidentResolution;
		const isDeleting = action === "Delete";

		if (!isDeleting) {
			this.dialogService.openFormDialog({
				title: `${action} ${this.title}`,
				component: IncidentResolutionEditComponent,
				formModel: incidentResolution
			});
		}
		else {
			this.dialogService.openConfirmationDialog({
				title: `${action} ${this.title}`,
				subtitle: incidentResolution.kbaId,
				message: `Are you sure you want to ${action} this ${this.title}?`
			});
		}

		this.dialogService.confirmed<any>().subscribe(x => {
			if (x) {
				apiCall(!isDeleting ? x : incidentResolution).subscribe(_ => this.notificationService.success(`${action} ${this.title} Successful`));
			}
		});
	}

}
