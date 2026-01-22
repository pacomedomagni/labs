import { ApplicationGroupIds } from '../data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../data/application/application.interface';
import { faUserGear } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.UserManagement,
    name: 'User Management',
    description: 'Enroll a new user into TMX Labs',
    faIcon: faUserGear,
    isReady: true,
    applications: [],
    access: ['isLabsAdmin'],
};
