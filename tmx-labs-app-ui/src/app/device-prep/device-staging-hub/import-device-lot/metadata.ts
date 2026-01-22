import { ApplicationGroupIds } from '../../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../../shared/data/application/application.interface';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.ImportDeviceLot,
    name: 'Import Device Lot',
    description: 'Import Device Lot',
    faIcon: faDownload,
    isReady: true,
    access: ['isLabsUser'],
};
