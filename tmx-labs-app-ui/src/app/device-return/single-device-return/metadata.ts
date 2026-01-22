import { ApplicationGroupIds } from '../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../shared/data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.SingleDeviceReturn,
    name: 'Single Device Return',
    description: 'Base landing page for Single Device Return.',
    svgIcon: 'ubi_snapshot_device',
    isReady: true,
    access: ['isLabsUser'],
};
