import { ApplicationGroupIds } from '../data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../data/application/application.interface';
import { faTools } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.Tools,
    name: 'Tools',
    description: 'Development and testing tools',
    faIcon: faTools,
    isReady: true,
    isNonProdOnly: true,
    applications: [],
    access: ['isLabsUser'],
};
