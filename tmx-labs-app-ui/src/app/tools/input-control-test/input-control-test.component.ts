import { Component, signal } from "@angular/core";
import { JsonPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DateTimeControlComponent } from "../../shared/components/form-controls/date-time-control/date-time-control.component";
import { DataListComponent } from "../../shared/components/data-list/data-list.component";
import { DataListRowComponent } from "../../shared/components/data-list/data-list-row.component";
import { DateTimeOptionsComponent } from "./options/date-time-options.component";

interface ControlOption {
    id: string;
    label: string;
}

@Component({
    selector: "tmx-input-control-test",
    standalone: true,
    imports: [
        FormsModule,
        JsonPipe,
        MatCardModule,
        MatSelectModule,
        MatFormFieldModule,
        DateTimeControlComponent,
        DataListComponent,
        DataListRowComponent,
        DateTimeOptionsComponent,
    ],
    templateUrl: "./input-control-test.component.html",
    styleUrls: ["./input-control-test.component.scss"],
})
export class InputControlTestComponent {
    controlTypes: ControlOption[] = [
        { id: "dateTime", label: "DateTime" },
    ];

    selectedControlType = signal<string>("dateTime");

    dateTimeModel = signal<Date | null>(null);
    isRequired = signal(false);
    isDisabled = signal(false);
    minDate = signal<Date | null>(null);
    maxDate = signal<Date | null>(null);
    label = signal("Test Date");
}
