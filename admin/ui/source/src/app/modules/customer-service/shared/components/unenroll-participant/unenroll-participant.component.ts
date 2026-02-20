import { AfterViewInit, Component, Inject, Input, OnInit, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";

@Component({
    selector: "tmx-cs-unenroll-participant",
    templateUrl: "./unenroll-participant.component.html",
    styleUrls: ["./unenroll-participant.component.scss"],
    standalone: false
})
export class UnenrollmentParticipantComponent implements OnInit, AfterViewInit {

  @Input() model: { unenrollmentReasons: string[] };
  @Input() parentForm: NgForm;
  @ViewChildren(NgModel) controls: QueryList<NgModel>;

  maxDate = new Date();
  selectedReason: string;

  constructor(@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any) { }

  ngOnInit(): void {
    this.model = this.model || this.injectedData.model;
    this.parentForm = this.parentForm || this.injectedData.form;

    if (this.model.unenrollmentReasons && this.model.unenrollmentReasons.length > 0) {
      this.selectedReason = this.model.unenrollmentReasons[0];
    }
  }

  ngAfterViewInit(): void {
    this.controls.filter(x => !x.isDisabled).forEach(x => this.parentForm.addControl(x));
  }
}