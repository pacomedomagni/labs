import { Component, Input, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { MatTableDataSource } from "@angular/material/table";
import { Observable } from "rxjs";
import { TransactionAuditLog } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { MatDialog } from "@angular/material/dialog";
import { DialogService } from "@modules/shared/services/_index";
import { TransactionLogViewerComponent } from "@modules/customer-service/shared/components/transaction-log-viewer/transaction-log-viewer.component";

@UntilDestroy()
@Component({
    selector: "tmx-policy-history-transaction-audit-log",
    templateUrl: "./transaction-audit-log.component.html",
    styleUrls: ["./transaction-audit-log.component.scss"],
    standalone: false
})
export class TransactionAuditLogComponent implements OnInit {

	@Input() data: Observable<TransactionAuditLog[]>;

	formats = UIFormats;
	dataSource: MatTableDataSource<TransactionAuditLog>;
	columns: string[] = [
		"tranSeqId",
		"createDate",
		"polNbr",
		"resultStat",
		"resultMsg",
		"tranName",
		"tranData",
		"resStat",
		"resComments"
	];

	constructor(
		public dialog: MatDialog,
		private dialogService: DialogService) { }

	ngOnInit(): void {
		this.data.pipe(untilDestroyed(this)).subscribe(x => {
			x.sort((y, z) => z.createDate.getTime() - y.createDate.getTime());
			this.dataSource = new MatTableDataSource<TransactionAuditLog>(x);
		});
	}

	openDialog(log: TransactionAuditLog) {
		this.dialogService.openInformationDialog({
			title: `Transaction Audit SeqID: ${log.transactionAuditSeqId}`,
			subtitle: `${log.createDate}`,
			component: TransactionLogViewerComponent,
			componentData: { Data: log.transactionData },
			width: CUI_DIALOG_WIDTH.LARGE
		});
	}

}
