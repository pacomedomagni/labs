import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIcon } from '@angular/material/icon';
import { StepperModule } from '@pgr-cla/core-ui-components';
import { UserEnrollmentStepperComponent } from './user-enrollment-stepper.component';
import { ContactDetailsFormComponent } from '../contact-details/contact-details-form.component';
import { VehicleDetailsComponent } from '../vehicle-details/vehicle-details.component';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { AddAccountRequest } from 'src/app/shared/data/user-management/resources';

describe('UserEnrollmentStepperComponent', () => {
    let component: UserEnrollmentStepperComponent;
    let fixture: ComponentFixture<UserEnrollmentStepperComponent>;

    const mockContactDetails = {
        name: 'John Doe',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
    };

    const mockVehicleDetails: VehicleDetails[] = [
        {
            year: 2020,
            make: 'Toyota',
            model: 'Camry',
            scoringAlgorithm: { description: 'desc', code: 1 }
        }
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                UserEnrollmentStepperComponent,
                ReactiveFormsModule,
                NoopAnimationsModule,
                MatCardModule,
                MatButtonModule,
                MatFormFieldModule,
                MatInputModule,
                MatStepperModule,
                StepperModule,
                MatIcon,
                ContactDetailsFormComponent,
                VehicleDetailsComponent
            ],
            providers: [FormBuilder]
        }).compileComponents();

        fixture = TestBed.createComponent(UserEnrollmentStepperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Groups', () => {
        it('should initialize contact details form group with required validator', () => {
            expect(component.contactDetailsFormGroup).toBeDefined();
            expect(component.contactDetails.hasError('required')).toBeTruthy();
        });

        it('should initialize vehicle details form group', () => {
            expect(component.vehicleDetailsFormGroup).toBeDefined();
            expect(component.vehicleDetails.value).toBeNull();
        });
    });

    describe('Form Getters', () => {
        it('should return contact details form control', () => {
            const contactControl = component.contactDetails;
            expect(contactControl).toBe(component.contactDetailsFormGroup.controls.contactDetails);
        });

        it('should return vehicle details form control', () => {
            const vehicleControl = component.vehicleDetails;
            expect(vehicleControl).toBe(component.vehicleDetailsFormGroup.controls.vehicleDetails);
        });
    });

    describe('getContactDetailsSummary', () => {
        it('should return empty string when contact details are null', () => {
            component.contactDetails.setValue(null);
            const summary = component.getContactDetailsSummary();
            expect(summary).toBe('');
        });

        it('should return empty string when form is invalid', () => {
            component.contactDetails.setValue(mockContactDetails);
            component.contactDetailsFormGroup.setErrors({ invalid: true });
            const summary = component.getContactDetailsSummary();
            expect(summary).toBe('');
        });

        it('should return formatted summary when contact details are valid', () => {
            component.contactDetails.setValue(mockContactDetails);
            component.contactDetailsFormGroup.setErrors(null);
            
            const summary = component.getContactDetailsSummary() as string[];
            expect(summary).toEqual([
                'John Doe',
                '123 Main St',
                'Anytown CA 12345'
            ]);
        });
    });

    describe('getVehicleSummary', () => {
        it('should return empty string when no vehicles', () => {
            component.vehicleDetails.setValue(null);
            const summary = component.getVehicleSummary();
            expect(summary).toBe('');
        });

        it('should return formatted vehicle summary', () => {
            component.vehicleDetails.setValue(mockVehicleDetails);
            const summary = component.getVehicleSummary() as string[];
            expect(summary).toEqual(['2020 Toyota Camry']);
        });

    });

    describe('mapToAddAccountRequest', () => {
        beforeEach(() => {
            component.contactDetails.setValue(mockContactDetails);
            component.vehicleDetails.setValue(mockVehicleDetails);
        });

        it('should map form values to AddAccountRequest correctly', () => {
            const request = component['mapToAddAccountRequest']();
            
            expect(request).toEqual(jasmine.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                userName: '',
                address: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zip: '12345',
                driversVehicles: jasmine.arrayContaining([
                    jasmine.objectContaining({
                        scoringAlgorithmCode: 1,
                        vehicle: jasmine.objectContaining({
                            year: 2020,
                            make: 'Toyota',
                            model: 'Camry'
                        })
                    })
                ])
            }));
        });

        it('should handle single name correctly', () => {
            component.contactDetails.setValue({ ...mockContactDetails, name: 'John' });
            const request = component['mapToAddAccountRequest']();
            
            expect(request.firstName).toBe('John');
            expect(request.lastName).toBe('');
        });

        it('should handle multiple last names correctly', () => {
            component.contactDetails.setValue({ ...mockContactDetails, name: 'John Von Der Berg' });
            const request = component['mapToAddAccountRequest']();
            
            expect(request.firstName).toBe('John');
            expect(request.lastName).toBe('Von Der Berg');
        });

        it('should handle empty vehicle details', () => {
            component.vehicleDetails.setValue(null);
            const request = component['mapToAddAccountRequest']();
            
            expect(request.driversVehicles).toEqual([]);
        });
    });

    describe('submit', () => {
        let onSubmittedSpy: jasmine.Spy;

        beforeEach(() => {
            onSubmittedSpy = spyOn(component.submitted, 'emit');
        });

        it('should emit onSubmitted when both forms are valid', () => {
            component.contactDetails.setValue(mockContactDetails);
            component.vehicleDetails.setValue(mockVehicleDetails);
            component.contactDetailsFormGroup.setErrors(null);
            component.vehicleDetailsFormGroup.setErrors(null);

            component.submit();

            expect(onSubmittedSpy).toHaveBeenCalledWith(jasmine.objectContaining({ firstName: jasmine.any(String) }));
        });

        it('should not emit when contact details form is invalid', () => {
            component.contactDetails.setValue(null);
            component.vehicleDetails.setValue(mockVehicleDetails);

            component.submit();

            expect(onSubmittedSpy).not.toHaveBeenCalled();
        });

        it('should not emit when vehicle details form is invalid', () => {
            component.contactDetails.setValue(mockContactDetails);
            component.vehicleDetails.setValue(mockVehicleDetails);
            component.contactDetailsFormGroup.setErrors(null);
            component.vehicleDetailsFormGroup.setErrors({ invalid: true });

            component.submit();

            expect(onSubmittedSpy).not.toHaveBeenCalled();
        });

        it('should emit correct AddAccountRequest structure', () => {
            component.contactDetails.setValue(mockContactDetails);
            component.vehicleDetails.setValue(mockVehicleDetails);
            component.contactDetailsFormGroup.setErrors(null);
            component.vehicleDetailsFormGroup.setErrors(null);

            component.submit();

            const emittedValue = onSubmittedSpy.calls.first().args[0] as AddAccountRequest;
            expect(emittedValue.fullName).toBe('John Doe');
            expect(emittedValue.firstName).toBe('John');
            expect(emittedValue.lastName).toBe('Doe');
            expect(emittedValue.driversVehicles).toHaveSize(1);
        });
    });

    describe('Event Emitters', () => {
        it('should emit onFirstStepBackClicked when called', () => {
            let emitted = false;
            component.firstStepBackClicked.subscribe(() => {
                emitted = true;
            });

            component.firstStepBackClicked.emit();
            expect(emitted).toBeTruthy();
        });
    });

    describe('ViewChild', () => {
        it('should have stepper ViewChild reference', () => {
            expect(component.stepper).toBeDefined();
        });
    });
});
