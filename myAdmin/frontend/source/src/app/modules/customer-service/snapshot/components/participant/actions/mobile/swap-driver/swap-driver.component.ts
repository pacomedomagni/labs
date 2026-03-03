import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { MobileRegistrationStatusSummary } from "@modules/shared/data/enums";
import { Participant } from "@modules/shared/data/resources";
import { first } from "rxjs/operators";

@Component({
    selector: "tmx-snapshot-swap-driver",
    templateUrl: "./swap-driver.component.html",
    styleUrls: ["./swap-driver.component.scss"],
    standalone: false
})
export class SwapDriverComponent implements OnInit, AfterViewInit {

	@Input() model: { destParticipant: undefined };
	@Input() participant: Participant;
	@Input() swappableParticipants: Participant[];
	@Input() parentForm: NgForm;
	@ViewChildren(NgModel) controls: QueryList<NgModel>;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		private query: SnapshotPolicyQuery
	) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;
		this.participant = this.participant || this.injectedData.data;

		this.query.policy$.pipe(first()).subscribe(x => {
			this.swappableParticipants = x.participants
				.filter(p => p.snapshotDetails.participantSeqId !== this.participant.snapshotDetails.participantSeqId)
				.filter(p => p.registrationDetails?.statusSummary === MobileRegistrationStatusSummary.Complete);
		});
	}

	ngAfterViewInit(): void {
		this.controls.forEach(x => this.parentForm.addControl(x));
	}

}
