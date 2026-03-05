import { ApplicationGroupIds } from '../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../shared/data/application/application.interface';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { metadata as activateDeActivate } from './activate-de-activate/metadata';
import { metadata as importDeviceLot } from './import-device-lot/metadata';
import { metadata as receiveDevices } from './receive-devices/metadata';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.DeviceStagingHub,
    name: 'Device Staging Hub',
    description: 'Activate, deactivate, or update location for a single device or an entire lot',
    faIcon: faClipboardList,
    isReady: true,
    access: ['isLabsUser'],
};

export const applicationGroups: ApplicationGroupMetadata[] = [
    activateDeActivate,
    importDeviceLot,
    receiveDevices];