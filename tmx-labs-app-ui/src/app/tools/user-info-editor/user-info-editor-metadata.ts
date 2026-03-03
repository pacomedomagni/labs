import { ApplicationGroupIds } from '../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../shared/data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.UserInfoEditor,
    name: 'User Info Editor',
    description: 'Add and remove user roles for testing',
    icon: 'person',
    isReady: true,
    access: ['isLabsUser'],
};
