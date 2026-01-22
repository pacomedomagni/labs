import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { ContactDetailsFormComponent } from './contact-details-form.component';

describe('ContactDetailsFormComponent', () => {
    let component: ContactDetailsFormComponent;
    let fixture: ComponentFixture<ContactDetailsFormComponent>;

    const validContactDetails = {
        name: 'John Doe',
        address1: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
    };

    const invalidContactDetails = {
        name: 'J', // Too short
        address1: '123', // Too short
        city: 'A', // Too short
        state: '', // Required
        zip: 'invalid' // Invalid format
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ContactDetailsFormComponent,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatButtonModule,
                NoopAnimationsModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ContactDetailsFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize form with required fields', () => {
            expect(component.detailsForm).toBeDefined();
            expect(component.detailsForm.get('name')).toBeDefined();
            expect(component.detailsForm.get('address1')).toBeDefined();
            expect(component.detailsForm.get('city')).toBeDefined();
            expect(component.detailsForm.get('state')).toBeDefined();
            expect(component.detailsForm.get('zip')).toBeDefined();
        });

        it('should initialize states array', () => {
            expect(component.states).toBeDefined();
            expect(component.states.length).toBeGreaterThan(0);
            expect(component.states).toContain('CA');
        });

        it('should start with invalid form', () => {
            expect(component.detailsForm.valid).toBeFalse();
        });
    });

    describe('Form Validation', () => {
        describe('name field', () => {
            it('should be invalid when empty', () => {
                const nameControl = component.detailsForm.get('name');
                nameControl?.setValue('');
                nameControl?.markAsTouched();
                
                expect(nameControl?.hasError('required')).toBeTruthy();
            });

            it('should be invalid when too short', () => {
                const nameControl = component.detailsForm.get('name');
                nameControl?.setValue('J');
                
                expect(nameControl?.hasError('minlength')).toBeTruthy();
            });

            it('should be invalid with numbers', () => {
                const nameControl = component.detailsForm.get('name');
                nameControl?.setValue('John123');
                
                expect(nameControl?.hasError('pattern')).toBeTruthy();
            });

            it('should be valid with letters and spaces', () => {
                const nameControl = component.detailsForm.get('name');
                nameControl?.setValue('John Doe');
                
                expect(nameControl?.valid).toBeTruthy();
            });
        });

        describe('address1 field', () => {
            it('should be invalid when empty', () => {
                const addressControl = component.detailsForm.get('address1');
                addressControl?.setValue('');
                
                expect(addressControl?.hasError('required')).toBeTruthy();
            });

            it('should be invalid when too short', () => {
                const addressControl = component.detailsForm.get('address1');
                addressControl?.setValue('123');
                
                expect(addressControl?.hasError('minlength')).toBeTruthy();
            });

            it('should be valid with sufficient length', () => {
                const addressControl = component.detailsForm.get('address1');
                addressControl?.setValue('123 Main Street');
                
                expect(addressControl?.valid).toBeTruthy();
            });
        });

        describe('city field', () => {
            it('should be invalid when empty', () => {
                const cityControl = component.detailsForm.get('city');
                cityControl?.setValue('');
                
                expect(cityControl?.hasError('required')).toBeTruthy();
            });

            it('should be invalid with numbers', () => {
                const cityControl = component.detailsForm.get('city');
                cityControl?.setValue('City123');
                
                expect(cityControl?.hasError('pattern')).toBeTruthy();
            });

            it('should be valid with letters and spaces', () => {
                const cityControl = component.detailsForm.get('city');
                cityControl?.setValue('New York');
                
                expect(cityControl?.valid).toBeTruthy();
            });
        });

        describe('state field', () => {
            it('should be invalid when empty', () => {
                const stateControl = component.detailsForm.get('state');
                stateControl?.setValue('');
                
                expect(stateControl?.hasError('required')).toBeTruthy();
            });

            it('should be valid with state abbreviation', () => {
                const stateControl = component.detailsForm.get('state');
                stateControl?.setValue('CA');
                
                expect(stateControl?.valid).toBeTruthy();
            });
        });

        describe('zip field', () => {
            it('should be invalid when empty', () => {
                const zipControl = component.detailsForm.get('zip');
                zipControl?.setValue('');
                
                expect(zipControl?.hasError('required')).toBeTruthy();
            });

            it('should be invalid with letters', () => {
                const zipControl = component.detailsForm.get('zip');
                zipControl?.setValue('ABCDE');
                
                expect(zipControl?.hasError('pattern')).toBeTruthy();
            });

            it('should be valid with 5 digits', () => {
                const zipControl = component.detailsForm.get('zip');
                zipControl?.setValue('12345');
                
                expect(zipControl?.valid).toBeTruthy();
            });

            it('should be valid with ZIP+4 format', () => {
                const zipControl = component.detailsForm.get('zip');
                zipControl?.setValue('12345-6789');
                
                expect(zipControl?.valid).toBeTruthy();
            });
        });
    });

    describe('ControlValueAccessor Implementation', () => {
        it('should implement writeValue correctly', () => {
            component.writeValue(validContactDetails);
            
            expect(component.detailsForm.get('name')?.value).toBe(validContactDetails.name);
            expect(component.detailsForm.get('address1')?.value).toBe(validContactDetails.address1);
            expect(component.detailsForm.get('city')?.value).toBe(validContactDetails.city);
            expect(component.detailsForm.get('state')?.value).toBe(validContactDetails.state);
            expect(component.detailsForm.get('zip')?.value).toBe(validContactDetails.zip);
        });

        it('should handle null value in writeValue', () => {
            // First set some values
            component.writeValue(validContactDetails);
            
            // Then clear with null
            component.writeValue(null);
            
            expect(component.detailsForm.get('name')?.value).toBeFalsy();
            expect(component.detailsForm.get('address1')?.value).toBeFalsy();
            expect(component.detailsForm.get('city')?.value).toBeFalsy();
            expect(component.detailsForm.get('state')?.value).toBeFalsy();
            expect(component.detailsForm.get('zip')?.value).toBeFalsy();
        });

        it('should register onChange callback', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            component.registerOnChange(mockOnChange);
            
            // Change a value to trigger onChange
            component.detailsForm.get('name')?.setValue('Test Name');
            
            expect(mockOnChange).toHaveBeenCalled();
        });

        it('should register onTouched callback', () => {
            const mockOnTouched = jasmine.createSpy('onTouched');
            component.registerOnTouched(mockOnTouched);
            
            // Mark form as touched
            component.detailsForm.markAsTouched();
            
            expect(mockOnTouched).toBeDefined();
        });

        it('should call onChange when form values change', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            component.registerOnChange(mockOnChange);
            
            component.detailsForm.patchValue({ name: 'New Name' });
            
            expect(mockOnChange).toHaveBeenCalled();
        });
    });

    describe('Custom Validation', () => {
        it('should return null when form is valid', () => {
            component.detailsForm.patchValue(validContactDetails);
            
            const validationResult = component.validate();
            
            expect(validationResult).toBeNull();
        });

        it('should return validation error when form is invalid', () => {
            component.detailsForm.patchValue(invalidContactDetails);
            
            const validationResult = component.validate();
            
            expect(validationResult).toEqual({ contactDetails: true });
        });

        it('should return null when form is not initialized', () => {
            component.detailsForm = undefined!;
            
            const validationResult = component.validate();
            
            expect(validationResult).toBeNull();
        });
    });

    describe('Helper Methods', () => {
        beforeEach(() => {
            component.detailsForm.patchValue(invalidContactDetails);
            component.detailsForm.markAllAsTouched();
        });

        it('should correctly identify field errors', () => {
            expect(component.hasFieldError('name', 'minlength')).toBeTruthy();
            expect(component.hasFieldError('state', 'required')).toBeTruthy();
            expect(component.hasFieldError('zip', 'pattern')).toBeTruthy();
        });

        it('should return false for non-existent errors', () => {
            expect(component.hasFieldError('name', 'nonexistent')).toBeFalsy();
        });

        it('should indicate errors for invalid fields', () => {
            expect(component.hasFieldError('state', 'required')).toBeTrue();
            expect(component.hasFieldError('zip', 'pattern')).toBeTrue();
        });

        it('should show no errors for valid fields', () => {
            component.detailsForm.get('name')?.setValue('Valid Name');
            component.detailsForm.get('name')?.markAsTouched();

            expect(component.hasFieldError('name', 'required')).toBeFalse();
            expect(component.hasFieldError('name', 'minlength')).toBeFalse();
            expect(component.hasFieldError('name', 'pattern')).toBeFalse();
        });
    });

    describe('Touch Handling', () => {
        it('should mark all fields as touched', () => {
            component.markAsTouched();
            
            Object.keys(component.detailsForm.controls).forEach(key => {
                expect(component.detailsForm.get(key)?.touched).toBeTruthy();
            });
        });

        it('should call onTouched when markAsTouched is called', () => {
            const mockOnTouched = jasmine.createSpy('onTouched');
            component.registerOnTouched(mockOnTouched);
            
            component.markAsTouched();
            
            expect(mockOnTouched).toHaveBeenCalled();
        });
    });

    describe('Form Integration', () => {
        it('should be valid with all valid data', () => {
            component.detailsForm.patchValue(validContactDetails);
            
            expect(component.detailsForm.valid).toBeTruthy();
        });

        it('should be invalid with any invalid data', () => {
            component.detailsForm.patchValue(invalidContactDetails);
            
            expect(component.detailsForm.invalid).toBeTruthy();
        });

        it('should emit form values on change', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            component.registerOnChange(mockOnChange);
            
            component.detailsForm.patchValue(validContactDetails);
            
            expect(mockOnChange).toHaveBeenCalledWith(jasmine.objectContaining(validContactDetails));
        });
    });
});
