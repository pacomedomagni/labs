import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { DeviceLot, DeviceLotStatus } from 'src/app/shared/data/lot-management/resources';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import { MenuButtonGroupComponent } from 'src/app/shared/components/menu-button-group/menu-button-group.component';
import { MenuButtonGroupFactory } from 'src/app/shared/components/menu-button-group/menu-button-group.service';
import { MenuButtonGroupItem } from 'src/app/shared/components/menu-button-group/models/menu-button-group.models';
import { DeviceLotStatusDescription } from 'src/app/shared/data/lot-management/constants';

enum actionItems {
    ActivateLot = 'activate-lot',
    DeactivateLot = 'deactivate-lot',
    UpdateLotStatus = 'update-lot-status'
}

@Component({
    selector: 'tmx-lot-details',
    standalone: true,
    imports: [CommonModule, MatCard, FallbackValuePipe, MenuButtonGroupComponent],
    templateUrl: './lot-details.component.html',
    styleUrl: './lot-details.component.scss',
})
export class LotDetailsComponent {
    deviceLot = input.required<DeviceLot>();

    actions: MenuButtonGroupItem[] = [
        MenuButtonGroupFactory.createButton({ id: actionItems.ActivateLot, label: 'Activate Lot' }),
        MenuButtonGroupFactory.createButton({ id: actionItems.DeactivateLot, label: 'Deactivate Lot' }),
        MenuButtonGroupFactory.createButton({ id: actionItems.UpdateLotStatus, label: 'Update Lot Status' })
    ];

    getStatusText(status?: DeviceLotStatus): string {
        return DeviceLotStatusDescription.get(status) || '--';
    }

    actionButtonClicked($event: MenuButtonGroupItem) {
        switch ($event.id) {
            case actionItems.ActivateLot:
                console.log('Activate Lot clicked for:', this.deviceLot().name);
                // TODO: Implement activate lot logic
                break;
            case actionItems.DeactivateLot:
                console.log('Deactivate Lot clicked for:', this.deviceLot().name);
                // TODO: Implement deactivate lot logic
                break;
            case actionItems.UpdateLotStatus:
                console.log('Update Lot Status clicked for:', this.deviceLot().name);
                // TODO: Implement update lot status logic
                break;
            default:
                console.warn('Unknown action:', $event.id);
        }
    }
}
