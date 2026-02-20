import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { BaseFormComponent } from "@modules/shared/components/form-controls/base-form";
import { IncidentResolution } from "@modules/shared/data/resources";

@Component({
    selector: "tmx-incident-resolution-edit",
    templateUrl: "./incident-resolution-edit.component.html",
    styleUrls: ["./incident-resolution-edit.component.scss"],
    standalone: false
})
export class IncidentResolutionEditComponent extends BaseFormComponent implements OnInit {

	@Input() model: IncidentResolution;

	constructor(@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any) {
		super(injectedData);
	}

	ngOnInit(): void {
		super.ngOnInit();
		this.model = this.model || this.injectedData.model;
	}

}
