import { faBoxes } from '@fortawesome/free-solid-svg-icons';
import { ApplicationGroupIds } from '../data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.OrderFulfillment,
    name: 'Order Fulfillment',
    description: 'Assign plug-in devices to TMX Labs participants and print shipping labels',
    faIcon: faBoxes,
    isReady: true,
    applications: [],
    access: ['isLabsUser'],
};
