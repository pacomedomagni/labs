import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { PluginDevice } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { ResourceQuery } from "@modules/shared/stores/resource-query";

@Component({
    selector: "tmx-policy-history-device-info",
    templateUrl: "./device-info.component.html",
    styleUrls: ["./device-info.component.scss"],
    standalone: false
})
export class DeviceInfoComponent implements OnInit {

	@Input() device: PluginDevice;

	formats = UIFormats;

	constructor(@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any, public helper: ResourceQuery) { }

	ngOnInit(): void {
		this.device = this.device || this.injectedData;
	}

}
