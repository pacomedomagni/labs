import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DialogService } from "@pgr-cla/core-ui-components";

import * as vkbeautify from "vkbeautify";

@Component({
    selector: "tmx-transaction-log-viewer",
    templateUrl: "./transaction-log-viewer.component.html",
    styleUrls: ["./transaction-log-viewer.component.scss"],
    standalone: false
})
export class TransactionLogViewerComponent implements OnInit {

	public xml: string;
	@Input() Data: string;
	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private matDialog: MatDialog,
		private dialogService: DialogService
	) { }

	ngOnInit(): void {
		let firstChar = this.injectedData.Data.substring(0, 1);
		if (firstChar === "<") {
			this.parseXml(this.injectedData.Data);
		}
		else if (firstChar === "{") {
			this.parseJSON(this.injectedData.Data);
		}
		else {
			this.Data = this.injectedData.Data;
		}

	}
	parseJSON(json: string) {
try {

		let displayTxt = JSON.stringify(JSON.parse(json), undefined, 4);
		displayTxt = displayTxt.replace(/\"(.*?)\"\:/g, `<span class='tag'>"\$1"</span>:`);
		this.Data = displayTxt;
	}
		catch {
			this.Data = json;
		}
	}

	parseXml(xml: string) {
		let displayTxt = (vkbeautify.xml(xml))
			.replace(/&/g, "&amp;").replace(/</g, "<span class='tag'>&lt;").replace(/>/g, "&gt;</span>").replace(/"/g, "&quot;");
		this.Data = displayTxt;
	}
}
