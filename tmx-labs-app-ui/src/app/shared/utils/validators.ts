import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class TmxValidators {
    /// This mimics the built in Angular email validator, but also adds additional special character handling outlined in the requirements.
    static validEmail(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            
            // Return null if empty (let required validator handle this)
            if (!value) {
                return null;
            }

            // Check for disallowed special characters
            const disallowedChars = /[()[\]:;,<>\\/?=!#$%^&*{}|~'"]/;
            if (disallowedChars.test(value)) {
                return { validEmail: true };
            }

            // Basic email format validation (similar to Angular's built-in)
            // This regex is based on Angular's email validator but more restrictive
            const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
            
            if (!emailRegex.test(value)) {
                return { validEmail: true };
            }

            // Additional validation rules
            // No consecutive dots
            if (value.includes('..')) {
                return { validEmail: true };
            }

            // No dot at start or end of local part
            const [localPart, domainPart] = value.split('@');
            if (localPart.startsWith('.') || localPart.endsWith('.')) {
                return { validEmail: true };
            }

            // Domain validation
            if (domainPart.startsWith('.') || domainPart.endsWith('.') || 
                domainPart.startsWith('-') || domainPart.endsWith('-')) {
                return { validEmail: true };
            }

            return null;
        };
    }
}
