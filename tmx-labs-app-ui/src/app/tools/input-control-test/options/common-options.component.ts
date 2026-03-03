import { Component, input, output } from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
    selector: "tmx-common-options",
    standalone: true,
    imports: [MatCheckboxModule],
    template: `
        <ul class="flex flex-col">
            <li>
                <mat-checkbox
                    [checked]="isRequired()"
                    (change)="isRequiredChange.emit($event.checked)"
                >Is Required?</mat-checkbox>
            </li>
            <li>
                <mat-checkbox
                    [checked]="isDisabled()"
                    (change)="isDisabledChange.emit($event.checked)"
                >Is Disabled?</mat-checkbox>
            </li>
        </ul>
    `,
    styles: [`
        ul { list-style: none; padding: 0; margin: 0; }
        li { display: block; }
    `]
})
export class CommonOptionsComponent {
    isRequired = input(false);
    isDisabled = input(false);
    isRequiredChange = output<boolean>();
    isDisabledChange = output<boolean>();
}
