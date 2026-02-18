import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { BenchTestDeviceService } from 'src/app/shared/services/api/bench-test/bench-test-device.service';

export function deviceValidator(
    benchTestService: BenchTestDeviceService,
    boardId: number
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }

        return benchTestService.validateDeviceForBenchTest(control.value, boardId).pipe(
            map(response => {
                if (response.isAssigned) {
                    return { alreadyAssigned: { message: 'Device is currently assigned to a customer.' } };
                }
                else if (!response.simActive) {
                    return { simInactive: { message: 'The SIM is not active for this device.' } };
                }
                return null;
            }),
            catchError((error) => {
                if(error.status === 404) {
                    return of({ notFound: { message: 'Device serial number does not exist.' } });
                }
                return of(null);
            })
        );
    };
}
