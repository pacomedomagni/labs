import { Component, Inject, ViewChild, AfterViewInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "tmx-date-time-modal",
  templateUrl: "date-time-modal.component.html",
    standalone: false
})
export class DateTimeModalComponent implements AfterViewInit {
  dateTime: Date;
  hasDateError = false;
  @ViewChild("dateTimeControl") dateTimeControl: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { value: Date, label: string, min?: Date, isDisabled?: boolean },
    public dialogRef: MatDialogRef<DateTimeModalComponent>
  ) {
    this.dateTime = data.value ? new Date(data.value) : new Date();
  }

  ngAfterViewInit() {
    setTimeout(() => this.checkDateError(), 0);
  }

  checkDateError() {
    if (this.dateTimeControl && typeof this.dateTimeControl.getErrorMessage === "function") {
      this.hasDateError = !!this.dateTimeControl.getErrorMessage();
    } else {
      this.hasDateError = false;
    }
  }

  onSave() {
    this.dialogRef.close(this.dateTime);
  }

  onCancel() {
    this.dialogRef.close();
  }
}