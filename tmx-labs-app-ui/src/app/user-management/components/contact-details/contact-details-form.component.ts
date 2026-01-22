import { Component, inject, OnInit, signal, forwardRef, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { States } from 'src/app/shared/data/application/enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ContactDetails {
    name: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
}

@Component({
    selector: 'tmx-contact-details-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
    ],
    templateUrl: './contact-details-form.component.html',
    styleUrl: './contact-details-form.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ContactDetailsFormComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ContactDetailsFormComponent),
            multi: true
        }
    ]
})
export class ContactDetailsFormComponent implements OnInit, ControlValueAccessor {
    private formBuilder = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);

    detailsForm!: FormGroup;
    states!: string[];
    isSubmitting = signal(false);
    disabled = false;

    // ControlValueAccessor callbacks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onChange = (_value: ContactDetails | null): void => {
        // This will be replaced by registerOnChange
    };
    private onTouched = (): void => {
        // This will be replaced by registerOnTouched
    };

    ngOnInit(): void {
        this.buildForm();
        this.states = Object.values(States).filter((value) => typeof value === 'string');
        
        // Always emit the value, let validation handle validity
        this.detailsForm.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                this.onChange(value); // Always emit current value
            });

        // Mark as touched when any field is touched
        this.detailsForm.statusChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                if (this.detailsForm.touched) {
                    this.onTouched();
                }
            });
    }

    private buildForm(): void {
        this.detailsForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z]{2,}(\s+[a-zA-Z]{2,})+$/)]],
            address1: ['', [Validators.required, Validators.minLength(5)]],
            city: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
            state: ['', [Validators.required]],
            zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        });
    }

    // ControlValueAccessor implementation
    writeValue(value: ContactDetails | null): void {
        if (value) {
            this.detailsForm.patchValue(value, { emitEvent: false });
        } else {
            this.detailsForm.reset({ emitEvent: false });
        }
    }

    registerOnChange(fn: (value: ContactDetails | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Custom validator for the component
    validate(): ValidationErrors | null {
        if (!this.detailsForm) {
            return null;
        }
        return this.detailsForm.valid ? null : { contactDetails: true };
    }

    // Helper methods for template
    hasFieldError(fieldName: string, errorType: string): boolean {
        const field = this.detailsForm.get(fieldName);
        return !!(field?.hasError(errorType) && (field?.dirty || field?.touched));
    }
    
    // Method to trigger touched state manually if needed
    markAsTouched(): void {
        this.detailsForm.markAllAsTouched();
        this.onTouched();
    }
}
