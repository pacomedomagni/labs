import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';
import { Observable, of, map, catchError } from 'rxjs';
import { ValidateDeviceForFulfillmentResponse } from 'src/app/shared/data/fulfillment/resources';
import { FulfillmentService } from 'src/app/shared/services/api/fulfillment/fulfillment.services';

export class AssignDevicesValidators {
  static validateDeviceSerialNumber(fulfillmentService: FulfillmentService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return fulfillmentService.validateDevice({ deviceSerialNumber: control.value }).pipe(
        map((response: ValidateDeviceForFulfillmentResponse) => {
          if (!response.isValid) {
            const errors: ValidationErrors = {};
            
            if (!response.isExistent) {
              errors['deviceNotFound'] = { value: control.value };
            }
            if (!response.isBenchtested) {
              errors['deviceNotBenchtested'] = { value: control.value };
            }
            if (response.isAssigned) {
              errors['deviceAlreadyAssigned'] = { value: control.value };
            }
            if(!response.isAvailable){
              errors['deviceNotAvailable'] = { value: control.value };
            }
            
            return errors;
          }
          return null;
        }),
        catchError(() => of({ validationError: { value: control.value } }))
      );
    };
  }

  static uniqueDevice(formArray: FormArray): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim().toLowerCase();
      const duplicates = formArray.controls.filter(
        c => c !== control && c.value?.trim().toLowerCase() === value
      );

      return duplicates.length > 0 ? { deviceDuplicate: { value: control.value } } : null;
    };
  }
}
