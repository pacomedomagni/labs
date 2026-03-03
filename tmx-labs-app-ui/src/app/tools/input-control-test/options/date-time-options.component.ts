import { Component, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CommonOptionsComponent } from "./common-options.component";

@Component({
    selector: "tmx-date-time-options",
    standalone: true,
    imports: [FormsModule, MatFormFieldModule, MatInputModule, CommonOptionsComponent],
    template: `
        <tmx-common-options
            [isRequired]="isRequired()"
            (isRequiredChange)="isRequiredChange.emit($event)"
            [isDisabled]="isDisabled()"
            (isDisabledChange)="isDisabledChange.emit($event)"
        ></tmx-common-options>

        <mat-form-field appearance="outline" class="mt-xxs">
            <mat-label>Min Date</mat-label>
            <input matInput type="date" [ngModel]="minDateStr()" (ngModelChange)="onMinDateChange($event)">
        </mat-form-field>

        <mat-form-field appearance="outline" class="mt-xxs">
            <mat-label>Max Date</mat-label>
            <input matInput type="date" [ngModel]="maxDateStr()" (ngModelChange)="onMaxDateChange($event)">
        </mat-form-field>

        <mat-form-field appearance="outline" class="mt-xxs">
            <mat-label>Label</mat-label>
            <input matInput type="text" [ngModel]="label()" (ngModelChange)="labelChange.emit($event)">
        </mat-form-field>
    `,
    styles: [`
        :host { display: block; }
        mat-form-field { display: block; }
    `]
})
export class DateTimeOptionsComponent {
    isRequired = input(false);
    isDisabled = input(false);
    minDate = input<Date | null>(null);
    maxDate = input<Date | null>(null);
    label = input('');

    isRequiredChange = output<boolean>();
    isDisabledChange = output<boolean>();
    minDateChange = output<Date | null>();
    maxDateChange = output<Date | null>();
    labelChange = output<string>();

    minDateStr = () => this.toDateString(this.minDate());
    maxDateStr = () => this.toDateString(this.maxDate());

    onMinDateChange(value: string): void {
        this.minDateChange.emit(value ? new Date(value + 'T00:00:00') : null);
    }

    onMaxDateChange(value: string): void {
        this.maxDateChange.emit(value ? new Date(value + 'T00:00:00') : null);
    }

    private toDateString(date: Date | null): string {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
