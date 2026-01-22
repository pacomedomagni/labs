import { ApplicationGroupIds } from '../../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../../shared/data/application/application.interface';
import { faToggleOn } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.ActivateDeactivateDevices,
    name: 'Activate/Deactivate Devices',
    description: 'Base landing page for Activate/Deactivate Devices.',
    faIcon: faToggleOn,
    isReady: true,
    access: ['isLabsUser'],
};
