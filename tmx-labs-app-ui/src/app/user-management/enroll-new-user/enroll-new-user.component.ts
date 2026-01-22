import { AfterViewInit, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { UserEnrollmentStepperComponent } from '../components/user-enrollment-stepper/user-enrollment-stepper.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatAnchor } from '@angular/material/button';
import { EmptyStateComponent, EmptyStateModule } from '@pgr-cla/core-ui-components';
import { CustomerServiceService } from 'src/app/shared/services/api/customer-service/customer-service.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TmxValidators } from 'src/app/shared/utils/validators';
import { AddAccountRequest } from 'src/app/shared/data/user-management/resources';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum EnrollmentState {
    Initial = 'initial',
    UserExists = 'user-exists',
    ReadyToEnroll = 'ready-to-enroll',
    Complete = 'complete',
}

@Component({
    selector: 'tmx-enroll-new-user',
    imports: [
        UserEnrollmentStepperComponent,
        FormsModule,
        MatInputModule,
        MatCard,
        MatAnchor,
        EmptyStateComponent,
        EmptyStateModule,
        ReactiveFormsModule,
    ],
    templateUrl: './enroll-new-user.component.html',
    styleUrl: './enroll-new-user.component.scss',
})
export class EnrollNewUserComponent implements AfterViewInit {
    private destroyRef = inject(DestroyRef);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    customerServiceService = inject(CustomerServiceService);

    emailAddressInput = viewChild<ElementRef<HTMLInputElement>>('emailAddressInput');

    emailForm: FormGroup;
    submittedEmailAddress = signal('');
    newUserFullName = signal<string>('');
    deviceOrderSeqIDs = signal<number[]>([]);
    shouldAnnounceInitialState = signal(false);

    // State management
    private currentState = signal<EnrollmentState>(EnrollmentState.Initial);
    initialState = computed(() => this.currentState() === EnrollmentState.Initial);
    userAlreadyExistsState = computed(() => this.currentState() === EnrollmentState.UserExists);
    enrollmentState = computed(() => this.currentState() === EnrollmentState.ReadyToEnroll);
    enrollmentCompleteState = computed(() => this.currentState() === EnrollmentState.Complete);

    constructor() {
        this.emailForm = this.fb.group({
            emailAddress: [null, [Validators.required, TmxValidators.validEmail()]],
        });

        effect(() => {
            const emailControl = this.emailForm.get('emailAddress');
            if (this.enrollmentState()) {
                emailControl?.disable();
            } else {
                emailControl?.enable();
            }
        });
    }

    ngAfterViewInit() {
        // Delay announcement to ensure aria-live region detects the change
        setTimeout(() => {
            this.shouldAnnounceInitialState.set(true);
        }, 100);
    }

    get emailAddress(): string {
        return this.emailForm.get('emailAddress')?.value;
    }

    onSubmitClicked() {
        if (this.emailForm.valid) {
            this.submittedEmailAddress.set(this.emailAddress);
            this.customerServiceService
                .validateNewCustomer(this.emailAddress)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((response) => {
                    if (!response.isAbleToEnroll && response.isCustomer) {
                        this.setState(EnrollmentState.UserExists);
                    } else {
                        this.setState(EnrollmentState.ReadyToEnroll);
                    }
                });
        }
    }

    onStepperSubmitted(data: AddAccountRequest) {
        // Submit with stepper data and email address as username
        this.customerServiceService
            .submitNewUserEnrollment({ ...data, userName: this.emailAddress })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.deviceOrderSeqIDs.set(response.deviceOrderSeqIDs);
                    this.newUserFullName.set(data.fullName);
                    this.setState(EnrollmentState.Complete);
                },
            });
    }

    onStepperBackedOut() {
        this.setState(EnrollmentState.Initial);
        setTimeout(() => {
            this.emailAddressInput()?.nativeElement.focus();
        });
    }

    viewCustomer() {
        this.router.navigate(['/CustomerService/Apps/Search'], {
            queryParams: {
                email: this.submittedEmailAddress(),
            },
        });
    }

    assignDevice() {
        this.setState(EnrollmentState.Initial);
        this.emailForm.reset();

        this.router.navigate(['/DeviceOrder/PendingOrders'], {
            queryParams: {
                deviceOrderSeqIDs: this.deviceOrderSeqIDs(),
            },
        });
    }

    private setState(newState: EnrollmentState) {
        this.currentState.set(newState);
    }
}
