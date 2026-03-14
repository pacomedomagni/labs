import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Policy } from "@modules/shared/data/resources";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ArePolicyService } from "../../services/are-policy.service";
import { ArePolicyQuery } from "../../stores/_index";
import { EnumService } from "@modules/shared/services/_index";

@UntilDestroy()
@Component({
    selector: "tmx-are-multi-policy-details",
    templateUrl: "./multi-policy-details.component.html",
    styleUrls: ["./multi-policy-details.component.scss"],
    standalone: false
})
export class MultiPolicyDetailsComponent implements AfterViewInit {

	displayedColumns: string[] = ["policyNumber", "mobileStatus", "select"];
	selectedIndex: number;
	dataSource: MatTableDataSource<Policy> = new MatTableDataSource([]);

	@ViewChild(MatPaginator) paginator: MatPaginator;

	constructor(
		private policyService: ArePolicyService,
		private query: ArePolicyQuery,
		public enums: EnumService,) {
		this.query.multiPolicy$.pipe(untilDestroyed(this)).subscribe(x => this.dataSource.data = x ?? []);
	}

	ngAfterViewInit(): void {
		this.dataSource.paginator = this.paginator;
	}

	selectRow(index: number): void {
		this.selectedIndex = index;
	}

	selectPolicy(policyNumber: string): void {
		this.policyService.getPolicy(policyNumber).subscribe();
	}

}
