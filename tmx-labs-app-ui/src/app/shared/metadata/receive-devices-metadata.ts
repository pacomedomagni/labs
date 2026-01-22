import { ApplicationTypeIds } from '../data/application/application-groups.model';
import { ApplicationMetadata } from '../data/application/application.interface';

export enum AppName {
    DeviceHistory = 'DeviceHistory',
    ReceiveDevices = 'ReceiveDevices',
}

export const metadata: ApplicationMetadata = {
    id: AppName.ReceiveDevices,
    name: 'Receive Devices',
    typeId: ApplicationTypeIds.Tool,
    description: `Receive Devices`,
    isReady: true,
    access: ['isLabsUser'],
};
