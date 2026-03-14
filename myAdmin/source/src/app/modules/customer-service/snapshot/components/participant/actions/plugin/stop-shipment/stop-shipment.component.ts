import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { StopShipmentMethod } from "@modules/shared/data/enums";
import { EnumService } from "@modules/shared/services/_index";

@Component({
    selector: "tmx-snapshot-stop-shipment",
    templateUrl: "./stop-shipment.component.html",
    styleUrls: ["./stop-shipment.component.scss"],
    standalone: false
})
export class StopShipmentComponent implements OnInit, AfterViewInit {

	@Input() model: { stopShipmentMethod: string };
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	options: string[];

	constructor(@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any, public enumService: EnumService) {
		this.options = [
			this.enumService.stopShipmentMethod.description(StopShipmentMethod.OptOut),
			this.enumService.stopShipmentMethod.description(StopShipmentMethod.SetMonitoringComplete)
		];
	}

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
	}

	ngAfterViewInit(): void {
		this.controls.filter(x => !x.isDisabled).forEach(x => this.parentForm.addControl(x));
	}
}
