import { Injectable, inject } from '@angular/core';
import { MenuButtonGroupItem } from 'src/app/shared/components/menu-button-group/models/menu-button-group.models';
import { MenuButtonGroupFactory } from 'src/app/shared/components/menu-button-group/menu-button-group.service';
import {
    ActionDisplayRulesService,
    ActionVisibilityContext,
} from '../action-rules/action-display-rules.service';

export enum ParticipantActionItems {
    MarkAbandoned = 'mark-abandoned',
    MarkDefective = 'mark-defective',
    EditNickname = 'edit-nickname',
    EditVehicle = 'edit-vehicle',
    ReplaceDevice = 'replace-device',
    SwapDevices = 'swap-devices',
    PingDevice = 'ping-device',
    ResetDevice = 'reset-device',
    ManageAudio = 'manage-audio',
    OptOutParticipant = 'opt-out-participant',
    FulfillDeviceOrder = 'fulfill-device-order',
    ViewTrips = 'view-trips',
    ExcludeTrips = 'exclude-trips',
    DeleteParticipant = 'delete-participant',
}

export type EnrollmentParticipantAction = MenuButtonGroupItem;

@Injectable({
    providedIn: 'root',
})
export class ParticipantActionButtonsService {
    private readonly actionDisplayRules = inject(ActionDisplayRulesService);

    /**
     * Creates the complete action button groups for a participant
     */
    createParticipantActions(context: ActionVisibilityContext): EnrollmentParticipantAction[] {
        const plugInActions = this.createPlugInActions(context);

        const groups: EnrollmentParticipantAction[] = [this.createGeneralActionsGroup(context)];

        if (plugInActions.length > 0) {
            groups.push(this.createPlugInActionsGroup(plugInActions));
        }

        return groups;
    }

    /**
     * Creates plug-in related action buttons
     */
    private createPlugInActions(context: ActionVisibilityContext): EnrollmentParticipantAction[] {
        const actions: EnrollmentParticipantAction[] = [];

        if (this.actionDisplayRules.canSwapDevices(context)) {
            actions.push(this.createSwapDevicesButton());
        }

        if (this.actionDisplayRules.canReplaceDevice(context)) {
            actions.push(this.createReplaceDeviceButton());
        }

        if (this.actionDisplayRules.canResetDevice(context)) {
            actions.push(this.createResetDeviceButton());
        }

        if (this.actionDisplayRules.canBeMarkedAbandoned(context)) {
            actions.push(this.createMarkAbandonedButton());
        }

        if (this.actionDisplayRules.canBeMarkedDefective(context)) {
            actions.push(this.createMarkDefectiveButton());
        }

        if (this.actionDisplayRules.canPingDevice(context)) {
            actions.push(this.createPingDeviceButton());
        }

        if (this.actionDisplayRules.canManageAudio(context)) {
            actions.push(this.createManageAudioButton());
        }

        if (this.actionDisplayRules.canFulfillDeviceOrder(context)) {
            actions.push(this.createFulfillDeviceOrder());
        }

        return actions;
    }

    /**
     * Creates the general actions group (always visible)
     */
    private createGeneralActionsGroup(
        context: ActionVisibilityContext,
    ): EnrollmentParticipantAction {
        const children: EnrollmentParticipantAction[] = [
            this.createEditNicknameButton(),
            this.createEditVehicleButton(),
        ];

        if (this.actionDisplayRules.canExcludeTrips(context)) {
            children.push(this.createExcludeTripsButton());
        }

        if (this.actionDisplayRules.canOptOut(context)) {
            children.push(this.createOptOutButton());
        }

        if (this.actionDisplayRules.canDeleteVehicle(context)) {
            children.push(this.createDeleteParticipantButton());
        }

        if (this.actionDisplayRules.canViewTrips(context)) {
            children.push(this.createViewTripsButton());
        }

        return MenuButtonGroupFactory.createGroupHeader({
            id: 'general',
            label: 'General',
            children,
        });
    }

    /**
     * Creates the plug-in actions group
     */
    private createPlugInActionsGroup(
        plugInActions: EnrollmentParticipantAction[],
    ): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createGroupHeader({
            id: 'plug-in-actions',
            label: 'Plug-In',
            children: plugInActions,
        });
    }

    // Individual button creation methods
    private createFulfillDeviceOrder(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.FulfillDeviceOrder,
            label: 'Fulfill Device Order',
        });
    }

    private createSwapDevicesButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.SwapDevices,
            label: 'Swap Devices',
        });
    }

    private createReplaceDeviceButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.ReplaceDevice,
            label: 'Replace Device',
        });
    }

    private createResetDeviceButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.ResetDevice,
            label: 'Reset Device',
        });
    }

    private createMarkAbandonedButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.MarkAbandoned,
            label: 'Mark Abandoned',
        });
    }

    private createMarkDefectiveButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.MarkDefective,
            label: 'Mark Defective',
        });
    }

    private createPingDeviceButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.PingDevice,
            label: 'Ping Device',
        });
    }

    private createManageAudioButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.ManageAudio,
            label: 'Manage Audio',
        });
    }

    private createOptOutButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.OptOutParticipant,
            label: 'Opt Out',
        });
    }

    private createEditNicknameButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.EditNickname,
            label: 'Edit Nickname',
        });
    }

    private createEditVehicleButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.EditVehicle,
            label: 'Edit Vehicle',
        });
    }

    private createDeleteParticipantButton(): EnrollmentParticipantAction {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.DeleteParticipant,
            label: 'Delete Vehicle',
        });
    }

    private createViewTripsButton(): MenuButtonGroupItem {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.ViewTrips,
            label: 'View Trips',
        });
    }

    private createExcludeTripsButton(): MenuButtonGroupItem {
        return MenuButtonGroupFactory.createButton({
            id: ParticipantActionItems.ExcludeTrips,
            label: 'Exclude Trips',
        });
    }
}
