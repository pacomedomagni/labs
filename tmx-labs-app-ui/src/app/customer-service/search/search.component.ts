import {
    AfterViewInit,
    Component,
    effect,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
    WritableSignal,
} from '@angular/core';
import { MatCard } from '@angular/material/card';
import {
    EmptyStateComponent,
    SearchComponent,
    SearchSubmission,
    SearchType,
} from '@pgr-cla/core-ui-components';
import { CustomerSearchService } from '../../shared/services/api/customer/customer-search';
import { MatTableModule } from '@angular/material/table';
import { map, Subject, takeUntil } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EnrollmentResultsComponent } from './components/enrollment-results/enrollment-results.component';
import { EnrollmentDetailsComponent } from '../enrollment-details/enrollment-details.component';
import { EnrollmentDetailService } from '../enrollment-details/participant-details/services/enrollment-details/enrollment-details.service';
import { AccountService } from '../../shared/services/api/account/account.service';
import { Validators } from '@angular/forms';
import { SearchValidators } from './search-validators';
import {
    CustomerInfo,
    CustomerSearchResponse,
    GetCustsByDevSearchResponse,
    EnrollmentDetails,
} from 'src/app/shared/data/participant/resources';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'tmx-customer-service-search',
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    host: {
        '[class.search-disabled]': 'isSearchDisabled',
    },
  imports: [
    MatCard,
    EmptyStateComponent,
    SearchComponent,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    EnrollmentResultsComponent,
    EnrollmentDetailsComponent,
  ],
})
export class CustomerServiceSearchComponent implements OnDestroy, AfterViewInit, OnInit {
    @ViewChild('searchBox') searchBox!: SearchComponent;

    private route = inject(ActivatedRoute);
    private customerSearchService = inject(CustomerSearchService);
    private cdr = inject(ChangeDetectorRef);
    private enrollmentDetailService = inject(EnrollmentDetailService);
    private accountService = inject(AccountService);

    private _destroySubject$ = new Subject<void>();
    private routedEmailSearch?: string;
    private currentParticipantGroupId: number | null = null;

    searchTypes: SearchType[] = [];
    private _activeSearchType: SearchType;

    searchComplete: WritableSignal<boolean> = signal(false);
    customerResults: WritableSignal<CustomerInfo[]> = signal([]);
    recordCount: WritableSignal<number> = signal(0);
    shouldAnnounceInitialStatus: WritableSignal<boolean> = signal(false);
    showDetails: WritableSignal<boolean> = signal(false);
    enrollmentDetails: WritableSignal<EnrollmentDetails | null> = signal(null);

    private readonly LAST_NAME_EMAIL = 'Last Name/Email';
    private readonly DEVICE_ID = 'Device ID';

    isSearchDisabled = true;

    constructor() {
        this.searchTypes = [
            {
                type: this.LAST_NAME_EMAIL,
                ariaLabel: 'Last Name or Email',
                validators: [
                    SearchValidators.validEmail(),
                    SearchValidators.validLastName(),
                    Validators.required,
                ],
                errorMessageMap: {
                    invalidEmail: 'Please enter a valid email address.',
                    invalidLastName:
                        'Please enter a valid last name (only letters, spaces, hyphens, and apostrophes; 2-75 characters).',
                    required: 'This field is required.',
                },
            },
            {
                type: this.DEVICE_ID,
                ariaLabel: 'Device ID',
                validators: [
                    Validators.maxLength(50),
                    Validators.pattern('^\\s*[a-zA-Z0-9]+\\s*$'),
                    Validators.required,
                ],
                errorMessageMap: {
                    maxlength: 'Please enter less than 50 characters.',
                    pattern: 'Please enter a valid Device ID (letters and numbers only).',
                    required: 'This field is required.',
                },
            },
        ];

        // Watch for when exactly 1 result is returned and auto-view it
        effect(() => {
            const results = this.customerResults();
            if (results.length === 1 && this.searchComplete()) {
                this.viewParticipant(results[0]);
            } else if (results.length !== 1) {
                // Reset details view when results change and it's not a single result
                this.showDetails.set(false);
                this.enrollmentDetailService.clear();
            }
        });
    }

    onSearchSubmitted(value: SearchSubmission) {
        if (this._activeSearchType.type === this.LAST_NAME_EMAIL) {
            this.customerSearchService
                .getCustomersBySearchRequest(value.searchTerm?.trim() ?? '')
                .pipe(takeUntil(this._destroySubject$))
                .subscribe((response: CustomerSearchResponse) => {
                    this.customerResults.set(response.customers);
                    this.recordCount.set(response.recordCount);
                    this.searchComplete.set(true);
                });
        } else {
            this.customerSearchService
                .getCustomersByDeviceSearchRequest(value.searchTerm?.trim() ?? '')
                .pipe(
                    takeUntil(this._destroySubject$),
                    map((data: GetCustsByDevSearchResponse): CustomerInfo[] => {
                        return data.searchResults?.map((result) => result.customer) ?? [];
                    }),
                )
                .subscribe((customers: CustomerInfo[]) => {
                    this.customerResults.set(customers);
                    this.recordCount.set(customers.length);
                    this.searchComplete.set(true);
                });
        }
    }

    onSearchTypeChanged(searchType: SearchType): void {
        this._activeSearchType = searchType;
    }

    viewParticipant(customer: CustomerInfo): void {
        const baseDetails: EnrollmentDetails = {
            customer: customer,
            accounts: [],
        };

        this.enrollmentDetailService.updateEnrollmentDetails(baseDetails);
        this.enrollmentDetails.set(baseDetails);
        this.showDetails.set(true);
        
        const participantGroupSeqId = customer.participantGroup?.participantGroupSeqID ?? null;
        this.currentParticipantGroupId = participantGroupSeqId;

        if (participantGroupSeqId === null) {
            return;
        }

        this.accountService
            .getAccountsByParticipantGroupSeqId(participantGroupSeqId)
            .pipe(takeUntil(this._destroySubject$))
            .subscribe({
                next: (response) => {
                    if (this.currentParticipantGroupId !== participantGroupSeqId) {
                        return;
                    }
                    const updatedDetails: EnrollmentDetails = {
                        customer: customer,
                        accounts: response.accounts ?? [],
                    };
                    this.enrollmentDetailService.updateEnrollmentDetails(updatedDetails);
                    this.enrollmentDetails.set(updatedDetails);
                },
                error: () => {
                    if (this.currentParticipantGroupId === participantGroupSeqId) {
                        const errorDetails: EnrollmentDetails = {
                            customer: customer,
                            accounts: [],
                        };
                        this.enrollmentDetailService.updateEnrollmentDetails(errorDetails);
                        this.enrollmentDetails.set(errorDetails);
                    }
                },
            });
    }

    ngOnInit(): void {
        // Handle route params early
        this.route.queryParams.pipe(takeUntil(this._destroySubject$)).subscribe((params) => {
            const email = params['email'];
            if (email) {
                this._activeSearchType =
                    this.searchTypes.find((type) => type.type === this.LAST_NAME_EMAIL) ??
                    this.searchTypes[0];
                this.routedEmailSearch = email;
            } else {
                this._activeSearchType = this.searchTypes[0];
                this.routedEmailSearch = undefined;
            }
        });
    }

    ngAfterViewInit(): void {
        // Delay announcement to ensure aria-live region detects the change
        setTimeout(() => {
            this.shouldAnnounceInitialStatus.set(true);
        }, 100);

        // Set up form status monitoring
        this.searchBox.form.statusChanges
            .pipe(takeUntil(this._destroySubject$))
            .subscribe((status) => {
                this.isSearchDisabled = status !== 'VALID';
            });

        // Handle pending email after view is ready
        if (this.routedEmailSearch) {
            this.applyRoutedEmailSearch();
        }
    }

    private applyRoutedEmailSearch(): void {
        if (!this.routedEmailSearch || !this.searchBox?.form) return;

        // Use microtask to ensure we're outside current change detection (avoids changed after check errors)
        Promise.resolve().then(() => {
            this.searchBox.form.form.patchValue({
                searchTerm: this.routedEmailSearch,
            });

            const search: SearchSubmission = {
                searchType: this._activeSearchType,
                searchTerm: this.routedEmailSearch!,
            };
            this.onSearchSubmitted(search);
            this.routedEmailSearch = undefined;
        });
    }

    ngOnDestroy(): void {
        this._destroySubject$.next();
        this._destroySubject$.complete();
    }
}
