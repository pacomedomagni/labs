import { ApplicationGroupIds } from '../data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.DevicePreparation,
    name: 'Device Preparation',
    description: 'Prepare plug-in devices for distribution to TMX Labs participants',
    svgIcon: 'ubi_snapshot_device',
    isReady: true,
    applications: [],
    access: ['isLabsUser'],
};
