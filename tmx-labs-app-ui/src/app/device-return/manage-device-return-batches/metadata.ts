import { ApplicationGroupIds } from '../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../shared/data/application/application.interface';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.ManageDeviceReturnBatches,
    name: 'Manage Device Return Batches',
    description: 'Base landing page for Manage Device Return Batches.',
    faIcon: faDatabase,
    isReady: true,
    access: ['isLabsUser'],
};
