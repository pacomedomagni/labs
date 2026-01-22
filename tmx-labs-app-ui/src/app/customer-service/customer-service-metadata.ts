import { ApplicationGroupIds } from '../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../shared/data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.CustomerService,
    name: 'Customer Service',
    description: 'Manage the details of your TMX Labs enrollment',
    icon: 'emoji_people',
    isReady: true,
    applications: [],
    access: ['isLabsUser'],
};
