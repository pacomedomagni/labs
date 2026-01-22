import { Component, EventEmitter, Output, ViewChild, inject, AfterViewInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { VerticalStepperComponent, StepperModule } from '@pgr-cla/core-ui-components';
import { ContactDetailsFormComponent, ContactDetails } from '../contact-details/contact-details-form.component';
import { MatIcon } from '@angular/material/icon';
import { VehicleDetailsComponent } from '../vehicle-details/vehicle-details.component';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { AddAccountDriverVehicleInformation, AddAccountRequest } from 'src/app/shared/data/user-management/resources';

@Component({
    selector: 'tmx-user-enrollment-stepper',
    templateUrl: './user-enrollment-stepper.component.html',
    styleUrl: './user-enrollment-stepper.component.scss',
    imports: [
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        StepperModule,
        ContactDetailsFormComponent,
        MatIcon,
        VehicleDetailsComponent,
    ],
})
export class UserEnrollmentStepperComponent implements AfterViewInit {
    @ViewChild(VerticalStepperComponent, { static: true }) stepper: VerticalStepperComponent;
    @Output() submitted = new EventEmitter<AddAccountRequest>();
    @Output() firstStepBackClicked = new EventEmitter<void>();

    contactDetailsFormGroup: FormGroup<{
        contactDetails: FormControl<ContactDetails | null>;
    }>;

    vehicleDetailsFormGroup: FormGroup<{
        vehicleDetails: FormControl<VehicleDetails[] | null>;
    }>;

    reviewFormGroup: FormGroup<{
        dummyControl: FormControl<boolean>;
    }>;

    get contactDetails(): FormControl<ContactDetails | null> {
        return this.contactDetailsFormGroup.controls.contactDetails;
    }

    get vehicleDetails(): FormControl<VehicleDetails[] | null> {
        return this.vehicleDetailsFormGroup.controls.vehicleDetails;
    }

    getContactDetailsSummary(): string | string[] {
        const details = this.contactDetails?.value;
        if (details && this.contactDetailsFormGroup.valid) {
            // CoreUI stepper stacks each string by default
            return [
                details.name,
                details.address1,
                details.city + ' ' + details.state + ' ' + details.zip,
            ];
        }
        return '';
    }

    getVehicleSummary(): string | string[] {
        return this.vehicleDetails?.value?.map((v) => `${v.year} ${v.make} ${v.model}`) || '';
    }

    private fb = inject(FormBuilder);

    constructor() {
        this.contactDetailsFormGroup = this.fb.group({
            contactDetails: new FormControl<ContactDetails | null>(null, Validators.required),
        });

        this.vehicleDetailsFormGroup = this.fb.group({
            vehicleDetails: new FormControl<VehicleDetails[] | null>(null, Validators.required),
        });
        
        this.reviewFormGroup = this.fb.group({
            // This is required to make the the review step "incomplete" when going back to a previous step
            dummyControl: new FormControl<boolean>(false, Validators.requiredTrue),
        });
    }

    ngAfterViewInit(): void {
        if (this.stepper) {
            this.stepper.selectionChange.subscribe((event) => {
                // This is required to make the the review step "incomplete" when going back to a previous step
                this.reviewFormGroup.get('dummyControl')?.setValue(event.selectedIndex === 2); // Trigger validation
            });
        }
    }
    
    /**
     * Maps form values to AddAccountRequest
     * @returns Mapped AddAccountRequest object
     */
    private mapToAddAccountRequest(): AddAccountRequest {
        const contactDetails = this.contactDetails.value;
        const vehicleDetails = this.vehicleDetails.value;

        // Parse full name into first and last name
        const nameParts = contactDetails?.name?.split(' ') || ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
            firstName: firstName,
            lastName: lastName,
            fullName: contactDetails?.name || '',
            userName: '', // This will be set by the parent component
            address: contactDetails?.address1 || '',
            city: contactDetails?.city || '',
            state: contactDetails?.state || '',
            zip: contactDetails?.zip || '',
            driversVehicles:
                vehicleDetails?.map(
                    (vehicle) =>
                        ({
                            scoringAlgorithmCode: vehicle.scoringAlgorithm?.code,
                            vehicle: {
                                year: vehicle.year,
                                make: vehicle.make,
                                model: vehicle.model,
                            },
                        }) as AddAccountDriverVehicleInformation,
                ) || [],
        };
    }

    submit() {
        if (this.contactDetailsFormGroup.valid && this.vehicleDetailsFormGroup.valid) {
            const request = this.mapToAddAccountRequest();
            this.submitted.emit(request);
        }
    }
}
