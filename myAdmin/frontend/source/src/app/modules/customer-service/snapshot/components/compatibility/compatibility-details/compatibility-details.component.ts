import { Component, Inject, Input, OnChanges, Optional, ViewChild } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ParticipantService } from "@modules/customer-service/snapshot/services/participant.service";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { CompatibilityItem, Participant } from "@modules/shared/data/resources";
import { DialogService, LabelService } from "@modules/shared/services/_index";
import { CUI_DIALOG_WIDTH, NotificationService } from "@pgr-cla/core-ui-components";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { CompatibilityEditComponent } from "../compatibility-edit/compatibility-edit.component";

@Component({
    selector: "tmx-snapshot-compatibility-details",
    templateUrl: "./compatibility-details.component.html",
    styleUrls: ["./compatibility-details.component.scss"],
    standalone: false
})
export class CompatibilityDetailsComponent implements OnChanges {

	@Input() participant: Participant;
	@ViewChild(MatTable) table: MatTable<CompatibilityItem[]>;

	dataSource: MatTableDataSource<CompatibilityItem>;
	columns: string[] = ["create", "type", "description", "actions"];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private dialogService: DialogService,
		private labelService: LabelService,
		private participantService: ParticipantService,
		private notificationService: NotificationService,
		public query: SnapshotPolicyQuery) { }

	ngOnChanges(): void {
		this.dataSource = new MatTableDataSource<CompatibilityItem>(this.participant.snapshotDetails.compatibilityIssues);
	}

	editItem(item: CompatibilityItem): void {
		const title = "Edit Compatibility Issue";
		this.dialogService.openFormDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: CompatibilityEditComponent,
			componentData: { deviceExperience: this.participant.snapshotDetails.enrollmentExperience },
			formModel: item,
			width: CUI_DIALOG_WIDTH.LARGE
		});

		this.dialogService.confirmed<CompatibilityItem>().subscribe(x => {
			if (x !== undefined) {
				this.participantService.updateCompatibilityIssue(x).subscribe(success => {
					if(success) {
						this.notificationService.success(`${title} Successful`);
					}
					else {
						this.notificationService.error(`${title} Failed`);
					}
				});
			}
		});
	}

}
