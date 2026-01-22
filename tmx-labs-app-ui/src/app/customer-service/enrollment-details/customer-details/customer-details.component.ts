import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuButtonGroupComponent } from 'src/app/shared/components/menu-button-group/menu-button-group.component';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { EnrollmentCustomerDetailsService } from './services/customer-details.service';
import { MenuButtonGroupFactory } from 'src/app/shared/components/menu-button-group/menu-button-group.service';
import { AccordionModule, DialogService } from '@pgr-cla/core-ui-components';
import { EnrollmentDetailService } from '../participant-details/services/enrollment-details/enrollment-details.service';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import { DisplayDatePipe } from 'src/app/shared/pipes/display-date.pipe';
import { MenuButtonGroupItem } from 'src/app/shared/components/menu-button-group/models/menu-button-group.models';
import { CustomerInfo } from 'src/app/shared/data/participant/resources';

enum actionItems {
    AddVehicle = 'add-vehicle',
    UpdateCustomer = 'update-customer'
}

@Component({
    selector: 'tmx-customer-details',
    standalone: true,
    imports: [
        CommonModule,
        MenuButtonGroupComponent,
        FallbackValuePipe,
        DisplayDatePipe,
        AccordionModule
    ],
    templateUrl: './customer-details.component.html',
    styleUrls: ['./customer-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentCustomerDetailsComponent {
    dialogService = inject(DialogService);
    participantService = inject(ParticipantService);
    enrollmentDetailService = inject(EnrollmentDetailService);
    actionsService = inject(EnrollmentCustomerDetailsService);
    rightAlignToggle = true;

    customer = input.required<CustomerInfo>();

    actions: MenuButtonGroupItem[] = [
        MenuButtonGroupFactory.createButton({id: actionItems.AddVehicle, label: 'Add New Vehicle' }),
        MenuButtonGroupFactory.createButton({ id: actionItems.UpdateCustomer, label: 'Edit Customer Details' })
    ];

    display(value: string | null): string {
        return value && value.trim().length > 0 ? value : '--';
    }

    actionButtonClicked($event: MenuButtonGroupItem) {
        switch ($event.id) {
            case actionItems.AddVehicle:
                this.actionsService.openAddVehicleDialog(this.customer().participantGroup?.participantGroupSeqID)
                    .subscribe({
                        error: (error) => {
                            console.error('Error opening add vehicle dialog:', error);
                        }
                    });
                break;
            case actionItems.UpdateCustomer:
                this.actionsService.openUpdateCustomerDialog(this.customer())
                    .subscribe({
                        error: (error) => {
                            console.error('Error opening update customer dialog:', error);
                        }
                    });
                break;
            default:
                console.warn('Unknown action:', $event.id);
        }
    }
    
}
