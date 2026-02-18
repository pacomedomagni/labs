// Angular imports
import { ChangeDetectionStrategy, Component, computed, input, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';

// Third-party imports
import { AccordionModule } from '@pgr-cla/core-ui-components';

// Shared imports
import { MenuButtonGroupItem } from 'src/app/shared/components/menu-button-group/models/menu-button-group.models';
import { MenuButtonGroupComponent } from 'src/app/shared/components/menu-button-group/menu-button-group.component';
import { DisplayDatePipe } from 'src/app/shared/pipes/display-date.pipe';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import {
    AccountDeviceSummary,
    AccountDriverSummary,
    AccountParticipantSummary,
    AccountSummary,
    AccountVehicleSummary,
} from 'src/app/shared/data/participant/resources';

// Local service imports
import { ActionVisibilityContext } from './services/action-rules/action-display-rules.service';
import { VehicleEditDialogContext } from './services/edit-vehicle/edit-vehicle.service';
import { EnrollmentScoringAlgorithmService } from './services/enrollment-scoring/enrollment-scoring-algorithm.service';
import {
    ParticipantActionButtonsService,
    EnrollmentParticipantAction,
} from './services/participant-action-buttons/participant-action-buttons.service';
import { ParticipantDetailsFormattingService } from './services/participant-details-formatting/participant-details-formatting.service';
import { ParticipantNicknameDialogContext } from './services/participant-nickname/participant-nickname.service';
import { SwapDevicesService } from './services/swap-devices/swap-devices.service';
import { ActionHandlerService } from './services/action-handler/action-handler.service';
import { EMPTY_VEHICLE, EMPTY_DEVICE, EMPTY_DRIVER, EMPTY_PARTICIPANT } from './models/constants';
import { ActionHandlerContext, ParticipantDataRow } from './models/models';

@Component({
    selector: 'tmx-participant-details',
    standalone: true,
    imports: [
        CommonModule,
        AccordionModule,
        MatIconModule,
        MenuButtonGroupComponent,
        FallbackValuePipe,
        DisplayDatePipe,
    ],
    templateUrl: './participant-details.component.html',
    styleUrls: ['./participant-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantDetailsComponent {
    @ViewChild('accordionItem', { read: ElementRef }) accordionItem?: ElementRef<HTMLElement>;
    @ViewChild('accordionContent') accordionContent?: ElementRef<HTMLElement>;

    private readonly liveAnnouncer = inject(LiveAnnouncer);
    private readonly participantDetailsFormattingService = inject(
        ParticipantDetailsFormattingService,
    );
    private readonly scoringAlgorithmService = inject(EnrollmentScoringAlgorithmService);
    private readonly swapDevicesService = inject(SwapDevicesService);
    private readonly participantActionButtons = inject(ParticipantActionButtonsService);
    private readonly actionHandler = inject(ActionHandlerService);

    account = input.required<AccountSummary>();
    index = input.required<number>();
    total = input.required<number>();

    private readonly nicknameOverride = signal<string | null>(null);
    private readonly vehicleOverride = signal<AccountVehicleSummary | null>(null);
    private previousVehicleSeqId: number | null = null;
    private previousDeviceSeqId: number | null = null;

    constructor() {
        effect(() => {
            const vehicle = this.vehicleResource();
            const device = this.deviceResource();
            
            const currentVehicleSeqId = vehicle?.vehicleSeqID ?? null;
            const currentDeviceSeqId = device?.deviceSeqID ?? null;

            // If the vehicle or device has changed, reset the overrides
            if (
                (this.previousVehicleSeqId !== null && this.previousVehicleSeqId !== currentVehicleSeqId) ||
                (this.previousDeviceSeqId !== null && this.previousDeviceSeqId !== currentDeviceSeqId)
            ) {
                this.nicknameOverride.set(null);
                this.vehicleOverride.set(null);
            }

            this.previousVehicleSeqId = currentVehicleSeqId;
            this.previousDeviceSeqId = currentDeviceSeqId;
        });
    }

    actions = computed(() => {
        const context = this.visibilityContext();
        return this.participantActionButtons.createParticipantActions(context);
    });

    private readonly displayNickname = computed(
        () => this.nicknameOverride() ?? this.initialNickname(),
    );
    private readonly displayVehicle = computed(
        () => this.vehicleOverride() ?? this.vehicleResource(),
    );

    private readonly visibilityContext = computed(
        (): ActionVisibilityContext => ({
            participant: this.participantResource(),
            device: this.deviceResource(),
            eligibleSwapCandidatesCount: this.eligibleSwapCandidates().length
        }),
    );

    private readonly actionHandlerContext = computed(
        (): ActionHandlerContext => ({
            participantResource: this.participantResource,
            vehicleResource: this.vehicleResource,
            deviceResource: this.deviceResource,
            driverResource: this.driverResource,
            displayNickname: this.displayNickname,
            nicknameContext: this.nicknameContext,
            vehicleContext: this.vehicleContext,
            onNicknameUpdate: (nickname: string | null) => this.nicknameOverride.set(nickname),
            onVehicleUpdate: (vehicle: AccountVehicleSummary) => this.vehicleOverride.set(vehicle),
            onViewTripsClosed: () =>  this.focusParticipant()
        }),
    );

    isExpandedByDefault = computed(() => this.total() === 1);

    private readonly participantResource = computed<AccountParticipantSummary>(
        () => this.account().participant ?? EMPTY_PARTICIPANT,
    );

    private readonly vehicleResource = computed<AccountVehicleSummary>(
        () => this.account().vehicle ?? EMPTY_VEHICLE,
    );

    private readonly deviceResource = computed<AccountDeviceSummary>(
        () => this.account().device ?? EMPTY_DEVICE,
    );

    private readonly driverResource = computed<AccountDriverSummary>(
        () => this.account().driver ?? EMPTY_DRIVER,
    );

    private readonly eligibleSwapCandidates = computed(() => {
        const participantSeqId = this.participantResource().participantSeqID ?? null;
        if (!participantSeqId) {
            return [];
        }

        return this.swapDevicesService.getEligibleSwapCandidates(participantSeqId);
    });

    private readonly experienceType = computed<'OBD' | 'Mobile' | 'Unknown'>(() =>
        this.participantDetailsFormattingService.mapDeviceExperience(
            this.deviceResource().deviceExperienceTypeCode ?? null,
        ),
    );

    private readonly deviceStatus = computed(() =>
        this.participantDetailsFormattingService.describeDeviceStatus(
            this.deviceResource().deviceStatusCode,
        ),
    );

    private readonly initialNickname = computed(() => this.driverResource().nickname);

    deviceIcon = computed(() => {
        switch (this.experienceType()) {
            case 'Mobile':
                return 'ubi_snapshot_mobile';
            case 'OBD':
                return 'ubi_snapshot_device';
            default:
                return 'ubi_snapshot_device';
        }
    });

    participantLabel = computed(() => {
        if (this.total() > 1) {
            return `Participant (${this.index() + 1} of ${this.total()})`;
        }
        return 'Participant';
    });

    vehicleDisplay = computed(() =>
        this.participantDetailsFormattingService.formatVehicleYMM(this.displayVehicle()),
    );

    headerDisplayName = computed(() =>
        this.participantDetailsFormattingService.formatVehicleNickname(
            this.displayVehicle(),
            this.displayNickname(),
        ),
    );

    nicknameContext = computed<ParticipantNicknameDialogContext>(() => {
        const fallback = this.participantDetailsFormattingService.formatVehicleNickname(
            this.vehicleResource(),
            null,
        );
        return {
            currentNickname: this.displayNickname() || fallback,
            defaultNickname: fallback,
            participantSeqId: this.participantResource().participantSeqID ?? 0,
        };
    });

    vehicleContext = computed<VehicleEditDialogContext>(() => {
        const vehicle = this.displayVehicle();
        return {
            vehicle: {
                year: vehicle.year ?? 0,
                make: vehicle.make ?? '',
                model: vehicle.model ?? '',
                vehicleSeqID: vehicle.vehicleSeqID ?? null,
            },
            participantSeqID: this.participantResource().participantSeqID ?? undefined,
        };
    });

    menuActions = computed(() => {
        const nicknameContext = this.nicknameContext();
        const vehicleContext = this.vehicleContext();
        const hasVehicleDetails = Boolean(
            vehicleContext.vehicle.year && vehicleContext.vehicle.make,
        );

        const mapAction = (action: EnrollmentParticipantAction): EnrollmentParticipantAction => {
            if (action.id === 'edit-nickname') {
                return {
                    ...action,
                    disabled: (action.disabled ?? false) || nicknameContext.participantSeqId <= 0,
                };
            }

            if (action.id === 'edit-vehicle') {
                return {
                    ...action,
                    disabled: (action.disabled ?? false) || !hasVehicleDetails,
                };
            }

            if (action.children?.length) {
                return {
                    ...action,
                    children: action.children.map(mapAction),
                };
            }

            return action;
        };

        return this.actions().map(mapAction);
    });

    hasDeviceAssigned = computed(
        () => this.normalize(this.deviceResource().deviceSerialNumber) !== null,
    );

    baseInfoRows = computed<ParticipantDataRow[]>(() => {
        const participant = this.participantResource();
        const rows: ParticipantDataRow[] = [
            this.row(
                'Status',
                this.participantDetailsFormattingService.describeParticipantStatus(
                    participant.participantStatusCode,
                ),
                {
                    emphasize: true,
                    alwaysShow: true,
                },
            ),
            this.row('Reason Code', null, { emphasize: true }),
            this.row('Enrollment Date', participant.participantCreateDateTime ?? null, {
                alwaysShow: true,
            }),
            this.row('Change Date', participant.lastUpdateDateTime ?? null, { alwaysShow: true }),
            this.row('Opt Out Reason', null),
            this.row('Opt Out Date', null),
            this.row('Program Type', null, { emphasize: true }),
            this.row('Reqd Connect Days', null),
            this.row('Vehicle', this.vehicleDisplay(), { emphasize: true, alwaysShow: true }),
            this.row('Participant ID', participant.participantId ?? null, { alwaysShow: true }),
            this.row(
                'Scoring Algorithm',
                this.scoringAlgorithmService.formatScoringAlgorithm(
                    participant.scoringAlgorithmCode,
                ),
                {
                    emphasize: true,
                    alwaysShow: true,
                },
            ),
        ];

        return this.filterRows(rows);
    });

    deviceInfoRows = computed<ParticipantDataRow[]>(() => {
        const device = this.deviceResource();
        const rows: ParticipantDataRow[] = [
            this.row('Device Serial Number', device.deviceSerialNumber),
            this.row('SIM', device.sim),
            this.row('Device Status', this.deviceStatus(), { emphasize: true }),
            this.row(
                'Device Location',
                this.participantDetailsFormattingService.describeDeviceLocation(
                    device.deviceLocationCode,
                ),
            ),
            this.row('Device Manufacturer', device.deviceManufacturer),
            this.row('Device Type', device.deviceTypeDescription),
        ];

        if (this.hasDeviceAssigned()) {
            const reportedVin = this.normalize(device.reportedVIN) ?? 'No VIN Reported';
            rows.push(this.row('Device Reported VIN', reportedVin, { alwaysShow: true }));
        }

        rows.push(
            this.row('Device Ship Date', device.deviceShipDateTime),
            this.row('First Contact Date', device.firstContactDateTime),
            this.row('Last Contact Date', device.lastContactDateTime),
            this.row('Last Upload Date', device.lastUploadDateTime),
        );

        return this.filterRows(rows);
    });

    returnInfoRows = computed<ParticipantDataRow[]>(() => {
        const rows: ParticipantDataRow[] = [
            this.row('Return Reason', this.deviceReturnReason()),
            this.row('Return Date', this.deviceReturnDate()),
            this.row('Abandoned Date', this.deviceAbandonDate()),
        ];

        return this.filterRows(rows);
    });

    onActionClicked(action: MenuButtonGroupItem): void {
        const context = this.actionHandlerContext();
        this.actionHandler.handleAction(action, context);
    }

    deviceReturnReason = computed(() => {
        return this.participantDetailsFormattingService.describeDeviceReturnReason(
            this.deviceResource().deviceReturnReasonCode,
        );
    });

    deviceReturnDate = computed(() => {
        return this.deviceResource().deviceReceivedDateTime ?? null;
    });

    deviceAbandonDate = computed(() => {
        return this.deviceResource().deviceAbandonedDateTime ?? null;
    });

    private row(
        label: string,
        value: string | null | undefined,
        options: { emphasize?: boolean; alwaysShow?: boolean } = {},
    ): ParticipantDataRow {
        return {
            label,
            value,
            emphasize: options.emphasize ?? false,
            alwaysShow: options.alwaysShow ?? false,
        };
    }

    focusParticipant(): void {
        setTimeout(() => {
            const accordionHeader = this.accordionItem?.nativeElement.querySelector('cui-accordion-header button');
            if (accordionHeader instanceof HTMLElement) {
                accordionHeader.focus();
            }
        }, 0);
    }

    onAccordionOpened(): void {
        // Clear any previous screen reader announcements
        this.liveAnnouncer.announce('', 'assertive');
        
        // Build announcement with key details
        const label = this.participantLabel();
        const baseRows = this.baseInfoRows();
        const deviceRows = this.deviceInfoRows();
        const returnRows = this.returnInfoRows();
        
        const totalItems = baseRows.length + deviceRows.length + returnRows.length;
        
        setTimeout(() => {
            this.liveAnnouncer.announce(
                `${label} details expanded. ${totalItems} items. Use tab to navigate through each item.`, 
                'assertive'
            );
        }, 50);
    }

    private filterRows(rows: ParticipantDataRow[]): ParticipantDataRow[] {
        return rows.filter((row) => row.alwaysShow || this.normalize(row.value) !== null);
    }

    private normalize(value: string | null | undefined): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    getRowAriaLabel(row: ParticipantDataRow): string {
        const value = row.value ?? '';
        const normalizedValue = this.normalize(value);
        const displayValue = normalizedValue || 'Not available';
        return `${row.label}: ${displayValue}`;
    }
}
