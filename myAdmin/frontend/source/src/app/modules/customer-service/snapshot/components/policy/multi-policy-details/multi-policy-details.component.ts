import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Policy } from "@modules/shared/data/resources";
import { SnapshotPolicyService } from "@modules/customer-service/snapshot/services/_index";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { EnumService } from "@modules/shared/services/_index";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-multi-policy-details",
    templateUrl: "./multi-policy-details.component.html",
    styleUrls: ["./multi-policy-details.component.scss"],
    standalone: false
})
export class MultiPolicyDetailsComponent implements AfterViewInit {

	displayedColumns: string[] = ["policyNumber", "pni", "participantStatus", "mobileStatus", "select"];
	selectedIndex: number;
	dataSource: MatTableDataSource<Policy> = new MatTableDataSource([]);

	@ViewChild(MatPaginator) paginator: MatPaginator;

	constructor(
		private policyService: SnapshotPolicyService,
		private query: SnapshotPolicyQuery,
		public helper: ResourceQuery,
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
