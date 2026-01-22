import {
    AfterViewInit,
    Component,
    inject,
    Input,
    OnInit,
    QueryList,
    signal,
    ViewChildren,
} from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import {
    ScoringAlgorithm,
    VehicleDetails,
} from 'src/app/shared/data/vehicle/resources';
import { VinPicklistService } from 'src/app/shared/services/api/vin-picklist/vin-picklist.service';

@Component({
    selector: 'tmx-add-new-vehicle',
    imports: [FormsModule, MatFormField, MatLabel, MatInputModule, MatSelectModule],
    templateUrl: './add-new-vehicle.component.html',
    styleUrl: './add-new-vehicle.component.scss',
})
export class AddNewVehicleComponent implements OnInit, AfterViewInit {
    vinPicklistService = inject(VinPicklistService);

    @Input() vehicleDetails: VehicleDetails;
    @Input() parentForm: NgForm;
    @ViewChildren(NgModel) controls: QueryList<NgModel>;
    years = signal<string[]>([]);
    makes = signal<string[]>([]);
    models = signal<string[]>([]);
    scoringAlgos = signal<ScoringAlgorithm[]>([]);

    public injectedData = inject<{ model: VehicleDetails; form: NgForm }>(FORM_DIALOG_CONTENT, { optional: true });

    ngOnInit(): void {
        this.vehicleDetails = this.vehicleDetails || this.injectedData.model;
        this.parentForm = this.parentForm || this.injectedData.form;
        forkJoin({
            years: this.vinPicklistService.getVehicleYears(),
            algorithms: this.vinPicklistService.getScoringAlgorithms(),
        }).subscribe((response) => {
            this.years.set(response.years.modelYear.sort((a, b) => a.localeCompare(b)));
            this.scoringAlgos.set(
                response.algorithms.scoringAlgorithms.sort((a, b) =>
                    a.description.localeCompare(b.description),
                ),
            );
        });
    }

    ngAfterViewInit(): void {
        this.controls.forEach((x) => this.parentForm.addControl(x));
    }

    yearChange(year: string) {
        this.vinPicklistService.getVehicleMakes(year).subscribe((response) => {
            const makesWithUnknown = ['Unknown', ...response.makes];
            this.makes.set(makesWithUnknown);
        });
    }

    makeChange(make: string) {
        this.vinPicklistService
            .getVehicleModels(this.vehicleDetails.year.toString(), make)
            .subscribe((response) => {
                const modelsWithUnknown = ['Unknown', ...response.models];
                this.models.set(modelsWithUnknown);
            });
    }
}
