import { AfterViewInit, Component, OnInit, Inject, Input, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { Participant } from "@modules/shared/data/resources";

@Component({
    selector: "tmx-snapshot-update-guid",
    templateUrl: "./update-guid.component.html",
    styleUrls: ["./update-guid.component.scss"],
    standalone: false
})
export class UpdateGuidComponent implements OnInit, AfterViewInit {

	@Input() model: { guid: string };
	@Input() participant: Participant;
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.participant = this.participant || this.injectedData.data.participant;
		this.parentForm = this.parentForm || this.injectedData.form;
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

	isDuplicateGuid(): void {
		if (this.model?.guid === this.participant.snapshotDetails.participantId) {
			this.parentForm.controls["guid"].setErrors({ duplicate: true });
		}
	}

}
