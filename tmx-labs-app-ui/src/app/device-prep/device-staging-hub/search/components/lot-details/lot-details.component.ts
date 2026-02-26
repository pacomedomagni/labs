import { Component, computed, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import { MenuButtonGroupComponent } from 'src/app/shared/components/menu-button-group/menu-button-group.component';
import { MenuButtonGroupFactory } from 'src/app/shared/components/menu-button-group/menu-button-group.service';
import { MenuButtonGroupItem } from 'src/app/shared/components/menu-button-group/models/menu-button-group.models';
import { DeviceLotStatusDescription } from 'src/app/shared/data/lot-management/constants';
import { LotDetailActionsService } from './services/lot-detail-actions.service';
import { DeviceDetailsStateService, DeviceLotStateService } from '../../services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum ActionItems {
    ActivateLot = 'activate-lot',
    DeactivateLot = 'deactivate-lot',
    UpdateLotStatus = 'update-lot-status',
}

@Component({
    selector: 'tmx-lot-details',
    standalone: true,
    imports: [CommonModule, MatCard, FallbackValuePipe, MenuButtonGroupComponent],
    templateUrl: './lot-details.component.html',
    styleUrls: ['./lot-details.component.scss'],
})
export class LotDetailsComponent {
    private readonly deviceLotState = inject(DeviceLotStateService);
    private readonly deviceDetailsState = inject(DeviceDetailsStateService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly lotDetailActionsService = inject(LotDetailActionsService);

    // Expose deviceLot from state service
    readonly deviceLot = this.deviceLotState.deviceLot;

    lotStatusDescription = computed(() => {
        const lot = this.deviceLot();
        return lot ? DeviceLotStatusDescription.get(lot.statusCode) || '--' : '--';
    });

    // Dynamically build actions based on device state
    actions = computed<MenuButtonGroupItem[]>(() => {
        const actions: MenuButtonGroupItem[] = [];
        
        if (this.deviceDetailsState.hasInactiveSimDevices()) {
            actions.push(MenuButtonGroupFactory.createButton({
                id: ActionItems.ActivateLot,
                label: 'Activate Lot',
            }));
        }
        
        if (this.deviceDetailsState.hasActiveSimDevices()) {
            actions.push(MenuButtonGroupFactory.createButton({
                id: ActionItems.DeactivateLot,
                label: 'Deactivate Lot',
            }));
        }
        
        actions.push(MenuButtonGroupFactory.createButton({
            id: ActionItems.UpdateLotStatus,
            label: 'Update Lot Status',
        }));
        
        return actions;
    });

    actionButtonClicked($event: MenuButtonGroupItem) {
        const lot = this.deviceLot();
        if (!lot) return;
        
        switch ($event.id) {
            case ActionItems.ActivateLot:
                this.lotDetailActionsService
                    .activateLot(lot.lotSeqID, lot.name)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe();
                break;
            case ActionItems.DeactivateLot:
                this.lotDetailActionsService
                    .deactivateLot(lot.lotSeqID, lot.name)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe();
                break;
            case ActionItems.UpdateLotStatus:
                this.lotDetailActionsService
                    .updateLotStatus(lot.lotSeqID, lot.typeCode, lot.name)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe();
                break;
            default:
                console.warn('Unknown action:', $event.id);
        }
    }

}
