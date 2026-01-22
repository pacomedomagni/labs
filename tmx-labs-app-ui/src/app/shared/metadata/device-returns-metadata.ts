import { faTruckRampBox } from '@fortawesome/free-solid-svg-icons';
import { ApplicationGroupIds } from '../data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.DeviceReturn,
    name: 'Device Returns',
    description: 'Return plug-in devices to our inventory',
    faIcon: faTruckRampBox,
    isReady: true,
    applications: [],
    access: ['isLabsUser'],
};
