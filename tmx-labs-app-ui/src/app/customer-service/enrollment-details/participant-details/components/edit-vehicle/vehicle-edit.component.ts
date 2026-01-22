import {
    Component,
    inject,
    Input,
    QueryList,
    signal,
    ViewChildren,
    OnInit,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VehicleEditResult } from './vehicle-edit.models';
import { ScoringAlgorithm } from 'src/app/shared/data/vehicle/resources';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { VinPicklistService } from 'src/app/shared/services/api/vin-picklist/vin-picklist.service';

interface VehicleEditInjectedData {
    data?: {
        displayScoringAlgorithm?: boolean;
    };
    model?: VehicleEditResult;
    form?: NgForm;
}

@Component({
    selector: 'tmx-vehicle-edit',
    imports: [
        FormsModule,
        MatFormField,
        MatLabel,
        MatInputModule,
        MatSelectModule,
        MatError
    ],
    templateUrl: './vehicle-edit.component.html',
    styleUrl: './vehicle-edit.component.scss',
})
export class VehicleEditComponent implements OnInit, AfterViewInit, OnDestroy {
    vinPicklistService = inject(VinPicklistService);
    private destroy$ = new Subject<void>();

    @Input() vehicleDetails: VehicleEditResult;
    @Input() parentForm: NgForm;
    @ViewChildren(NgModel) controls: QueryList<NgModel>;
    years = signal<string[]>([]);
    makes = signal<string[]>([]);
    models = signal<string[]>([]);
    displayScoringAlgorithm = signal<boolean>(false);
    scoringAlgorithms = signal<ScoringAlgorithm[]>([]);

    public injectedData = inject<VehicleEditInjectedData>(FORM_DIALOG_CONTENT, { optional: true });

    get isVehicleTooOld(): boolean {
        const year = this.vehicleDetails?.vehicle?.year;
        return year != null && year < 1996;
    }

    get currentYearValue(): string {
        if (this.isVehicleTooOld) {
            return 'Unknown';
        }
        return this.vehicleDetails?.vehicle?.year
            ? this.vehicleDetails.vehicle.year.toString()
            : '';
    }

    set currentYearValue(value: string) {
        if (value === 'Unknown') {
            return;
        }
        if (this.vehicleDetails?.vehicle) {
            this.vehicleDetails.vehicle.year = value ? parseInt(value, 10) : 0;
        }
    }

    ngOnInit(): void {
        if (this.injectedData?.data?.displayScoringAlgorithm ?? false) {
            this.displayScoringAlgorithm.set(true);
        }
        this.vehicleDetails = this.vehicleDetails || this.injectedData.model;
        this.parentForm = this.parentForm || this.injectedData.form;
        forkJoin({
            years: this.vinPicklistService.getVehicleYears(),
            algorithms: this.vinPicklistService.getScoringAlgorithms(),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                const yearsWithUnknown = [
                    'Unknown',
                    ...response.years.modelYear.sort((a, b) => a.localeCompare(b)),
                ];
                this.years.set(yearsWithUnknown);
                this.scoringAlgorithms.set(response.algorithms.scoringAlgorithms);
                if (this.vehicleDetails?.vehicle.year) {
                    this.loadInitialData();
                }
            });
    }

    ngAfterViewInit(): void {
        this.controls.forEach((x) => this.parentForm.addControl(x));
    }

    yearChange(year: string) {
        if (year === 'Unknown') {
            if (this.parentForm) {
                this.parentForm.form.setErrors({ vehicleTooOld: true });
            }
            this.populateDropdownsForUnknownYear();
            return;
        }

        const formGroup = this.parentForm?.form;
        const formErrors = formGroup?.errors;
        if (formErrors && formErrors['vehicleTooOld']) {
            delete formErrors['vehicleTooOld'];
            if (Object.keys(formErrors).length === 0) {
                formGroup.setErrors(null);
            } else {
                formGroup.setErrors({ ...formErrors });
            }
        }

        if (this.vehicleDetails?.vehicle) {
            this.vehicleDetails.vehicle.year = year ? parseInt(year, 10) : 0;
            this.vehicleDetails.vehicle.make = '';
            this.vehicleDetails.vehicle.model = '';
        }

        this.makes.set([]);
        this.models.set([]);

        this.vinPicklistService
            .getVehicleMakes(year)
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                const makesWithUnknown = ['Unknown', ...response.makes];
                this.makes.set(makesWithUnknown);
            });
    }

    /*
    / Compare by code property to determine equality as objects may be different references
    */
    compareAlgorithms(algo1: ScoringAlgorithm, algo2: ScoringAlgorithm): boolean {
        return algo1 && algo2 ? algo1.code === algo2.code : algo1 === algo2;
    }

    makeChange(make: string) {
        if (this.vehicleDetails?.vehicle) {
            this.vehicleDetails.vehicle.model = '';
        }

        this.models.set([]);

        this.vinPicklistService
            .getVehicleModels(this.vehicleDetails.vehicle.year.toString(), make)
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                const modelsWithUnknown = ['Unknown', ...response.models];
                this.models.set(modelsWithUnknown);
            });
    }

    private loadInitialData(): void {
        const vehicle = this.vehicleDetails?.vehicle;
        if (!vehicle?.year) return;
        if (this.isVehicleTooOld) {
            if (this.parentForm) {
                this.parentForm.form.setErrors({ vehicleTooOld: true });
            }
            this.populateDropdownsForUnknownYear();
            return;
        }

        this.vinPicklistService
            .getVehicleMakes(vehicle.year.toString())
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.makes.set(response.makes);

                if (vehicle.make) {
                    this.vinPicklistService
                        .getVehicleModels(vehicle.year.toString(), vehicle.make)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe((modelResponse) => {
                            this.models.set(modelResponse.models);
                        });
                }
            });
    }

    private populateDropdownsForUnknownYear(): void {
        const vehicle = this.vehicleDetails?.vehicle;
        if (!vehicle) return;

        const makesToShow = vehicle.make ? [vehicle.make] : [];
        this.makes.set(makesToShow);

        const modelsToShow = vehicle.model ? [vehicle.model] : [];
        this.models.set(modelsToShow);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
