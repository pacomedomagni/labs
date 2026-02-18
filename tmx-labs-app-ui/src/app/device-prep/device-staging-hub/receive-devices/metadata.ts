import { ApplicationGroupIds } from '../../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../../shared/data/application/application.interface';
import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.ReceiveDevices,
    name: 'Device Staging Hub',
    description: 'Activate, deactivate, or update location for a single device or an entire lot',
    faIcon: faEnvelopeOpen,
    isReady: true,
    access: ['isLabsUser'],
};
