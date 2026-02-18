import {
    Component,
    computed,
    inject,
    OnDestroy,
    signal,
    ViewChild,
    WritableSignal
} from '@angular/core';
import { MatCard } from '@angular/material/card';
import {
    EmptyStateComponent,
    SearchComponent
} from '@pgr-cla/core-ui-components';
import { LotManagementService } from '../../../shared/services/api/lot-management/lot-management.service';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceLot } from 'src/app/shared/data/lot-management/resources';
import { LotDetailsComponent } from './components/lot-details/lot-details.component';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { MatInputModule } from '@angular/material/input';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { SearchValidators } from './search.validators';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

@Component({
    selector: 'tmx-device-staging-hub-search',
    standalone: true,
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    imports: [
        MatCard,
        EmptyStateComponent,
        LotDetailsComponent,
        DeviceDetailsComponent,
        MatInputModule,
        MatAnchor,
        MatButtonModule,
        ReactiveFormsModule,
    ],
})
export class DeviceStagingHubSearchComponent implements OnDestroy {
    @ViewChild('searchBox') searchBox!: SearchComponent;

    private lotManagementService = inject(LotManagementService);
    private notificationBannerService = inject(NotificationBannerService);

    private _destroySubject$ = new Subject<void>();

    deviceLot: WritableSignal<DeviceLot> = signal(null);

    initialState = computed(() => this.deviceLot() === null);

    searchQuery = new FormControl('', [
        Validators.required,
        SearchValidators.validLotIDOrSerialNumber(),
    ]);

    constructor() {}

    private findByLotName(searchTerm: string): void {
        // Try to find by lot name first, then by device serial number
        this.lotManagementService
            .getDeviceLot(searchTerm)
            .pipe(takeUntil(this._destroySubject$))
            .subscribe({
                next: (response: DeviceLot) => {
                    if (response && response.name) {
                        this.deviceLot.set(response);
                    } else {
                        // Try finding by serial number
                        this.findBySerialNumber(searchTerm);
                        return;
                    }
                },
                error: () => {
                    // If not found by lot name, try by serial number
                    this.findBySerialNumber(searchTerm);
                },
            });
    }

    private findBySerialNumber(serialNumber: string): void {
        this.lotManagementService
            .findLot(serialNumber)
            .pipe(takeUntil(this._destroySubject$))
            .subscribe({
                next: (response: DeviceLot) => {
                    if (response) {
                        this.deviceLot.set(response);
                    } else {
                        this.deviceLot.set(null);
                        this.showNoResultsError();
                    }
                },
                error: () => {
                    this.showNoResultsError();
                    this.deviceLot.set(null);
                },
            });
    }

    showNoResultsError() {
        this.notificationBannerService.error(
            'No results found. The provided Lot ID or Device Serial Number does not exist.',
        );
    }

    onSubmitClicked() {
        const searchTerm = this.searchQuery.value?.trim() ?? '';
        this.findByLotName(searchTerm);
    }

    ngOnDestroy(): void {
        this._destroySubject$.next();
        this._destroySubject$.complete();
    }
}
