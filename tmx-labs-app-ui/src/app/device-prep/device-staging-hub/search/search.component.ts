import {
    Component,
    computed,
    DestroyRef,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCard } from '@angular/material/card';
import {
    EmptyStateComponent
} from '@pgr-cla/core-ui-components';
import { LotManagementService } from '../../../shared/services/api/lot-management/lot-management.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceLot } from 'src/app/shared/data/lot-management/resources';
import { LotDetailsComponent } from './components/lot-details/lot-details.component';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { MatInputModule } from '@angular/material/input';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { SearchValidators } from './search.validators';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { DeviceLotStateService } from './services';

@Component({
    selector: 'tmx-device-staging-hub-search',
    standalone: true,
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
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
export class DeviceStagingHubSearchComponent {
    private readonly lotManagementService = inject(LotManagementService);
    private readonly notificationBannerService = inject(NotificationBannerService);
    private readonly deviceLotState = inject(DeviceLotStateService);
    private readonly destroyRef = inject(DestroyRef);

    initialState = computed(() => !this.deviceLotState.hasDeviceLot());

    searchQuery = new FormControl('', [
        Validators.required,
        SearchValidators.validLotIDOrSerialNumber(),
    ]);

    private findByLotName(searchTerm: string): void {
        // Try to find by lot name first, then by device serial number
        this.lotManagementService
            .getDeviceLot(searchTerm)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: DeviceLot) => {
                    if (response && response.name) {
                        this.deviceLotState.setDeviceLot(response);
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: DeviceLot) => {
                    if (response) {
                        this.deviceLotState.setDeviceLot(response);
                    } else {
                        this.deviceLotState.setDeviceLot(null);
                        this.showNoResultsError();
                    }
                },
                error: () => {
                    this.showNoResultsError();
                    this.deviceLotState.setDeviceLot(null);
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
}
