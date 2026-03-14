import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { MobileDevice } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";

@Component({
    selector: "tmx-policy-history-device-info-mobile",
    templateUrl: "./device-info-mobile.component.html",
    styleUrls: ["./device-info-mobile.component.scss"],
    standalone: false
})
export class DeviceInfoMobileComponent implements OnInit {

	@Input() device: MobileDevice;

	formats = UIFormats;

	constructor(@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any) { }

	ngOnInit(): void {
		this.device = this.device || this.injectedData;
	}

}
