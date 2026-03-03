import { ApplicationGroupIds } from '../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../shared/data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.InputControlTest,
    name: 'Input Control Test',
    description: 'Test shared form controls',
    icon: 'tune',
    isReady: true,
    access: ['isLabsUser'],
};
