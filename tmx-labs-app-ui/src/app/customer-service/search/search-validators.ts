import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class SearchValidators {
    static validLastName(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            // Only validate as last name if it doesn't look like an email (contains '@')
            if (
                !control.value ||
                typeof control.value !== 'string' ||
                control.value.toString().includes('@')
            ) {
                return null;
            }

            const trimmedValue = control.value.trim();
            const lastNameRegex = /^[a-zA-Z'-\s]+$/;
            return lastNameRegex.test(trimmedValue) &&
                trimmedValue.length >= 2 &&
                trimmedValue.length <= 75
                ? null
                : { invalidLastName: { value: control.value } };
        };
    }

    static validEmail(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (
                !control.value ||
                typeof control.value !== 'string' ||
                !control.value.toString().includes('@')
            ) {
                return null;
            }
            const trimmedValue = control.value.trim();

            // More restrictive regex - common business email patterns only
            const emailRegex =
                /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

            return emailRegex.test(trimmedValue)
                ? null
                : { invalidEmail: { value: control.value } };
        };
    }
}
