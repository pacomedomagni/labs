import { ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

export class SearchValidators {
    static validLotIDOrSerialNumber(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || typeof control.value !== 'string') {
                return null;
            }

            const trimmedValue = control.value.trim();
            // Allow alphanumeric, underscore, hyphens, colons, and spaces
            const validCharRegex = /^[a-zA-Z0-9_\-: ]+$/;
            
            return validCharRegex.test(trimmedValue)
                ? null
                : { invalidCharacters: { value: control.value } };
        };
    }
}
