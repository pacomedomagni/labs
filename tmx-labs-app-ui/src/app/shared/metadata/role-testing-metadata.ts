import { ApplicationGroupIds } from '../data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../data/application/application.interface';
import { faTools } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.RoleTestingTool,
    name: 'Role Testing Tool',
    description: 'Add and remove roles',
    faIcon: faTools,
    isReady: true,
    isNonProdOnly: true,
    applications: [],
    access: ['isLabsUser'],
};
