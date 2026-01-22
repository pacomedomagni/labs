import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DataListComponent } from 'src/app/shared/components/data-list/data-list.component';
import { DataListRowComponent } from 'src/app/shared/components/data-list/data-list-row.component';

export interface EditNicknameFormModel {
  newNickname: string;
}

export interface EditNicknameDialogData {
  currentNickname?: string;
  defaultNickname?: string;
  maxLength?: number;
}

interface EditNicknameDialogContent {
  model: EditNicknameFormModel;
  data: EditNicknameDialogData;
  form: NgForm;
  submit: () => void;
}

@Component({
  selector: 'tmx-edit-nickname',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInputModule,
    DataListComponent,
    DataListRowComponent,
  ],
  templateUrl: './edit-nickname.component.html',
  styleUrls: ['./edit-nickname.component.scss'],
})
export class EditNicknameComponent implements OnInit, AfterViewInit {
  @Input() parentForm: NgForm | null = null;
  @Input() formModel: EditNicknameFormModel = { newNickname: '' };
  @Input() currentNickname = '';
  @Input() defaultNickname = '';
  @Input() maxLength = 50;
  @ViewChildren(NgModel) controls?: QueryList<NgModel>;

  readonly nonWhitespacePattern = '.*\\S.*';

  private injectedContent = inject<EditNicknameDialogContent>(FORM_DIALOG_CONTENT, { optional: true });

  ngOnInit(): void {
    if (this.injectedContent) {
      this.formModel = this.injectedContent.model ?? this.formModel;
      this.parentForm = this.parentForm ?? this.injectedContent.form;
      this.applyDialogData(this.injectedContent.data);
    }

    this.formModel = this.formModel ?? { newNickname: '' };
  }

  ngAfterViewInit(): void {
    if (!this.parentForm || !this.controls) {
      return;
    }

    this.controls.forEach((control) => this.parentForm?.addControl(control));
  }

  get resolvedCurrentNickname(): string {
    const normalizedCurrent = this.normalizeNickname(this.currentNickname);
    if (normalizedCurrent) {
      return normalizedCurrent;
    }

    const normalizedDefault = this.normalizeNickname(this.defaultNickname);
    return normalizedDefault ?? '--';
  }

  private applyDialogData(data?: EditNicknameDialogData): void {
    if (!data) {
      return;
    }

    this.currentNickname = this.normalizeNickname(data.currentNickname) ?? this.currentNickname;
    this.defaultNickname = this.normalizeNickname(data.defaultNickname) ?? this.defaultNickname;
    this.maxLength = data.maxLength ?? this.maxLength;
  }

  private normalizeNickname(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
