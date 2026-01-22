import {
    ApplicationGroupIds,
    ApplicationTypeIds,
} from '../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../shared/data/application/application.interface';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.Portal,
    name: 'Portal',
    description: 'Portal',
    svgIcon: 'ubi_home',
    isReady: true,
    applications: [
        {
            id: 'ApplicationSelection',
            name: 'Application Selection',
            typeId: ApplicationTypeIds.Application,
            icon: 'home',
            description: `
			Labs App is a web UI used for lorem ipsum dolor sit amet`,
            isReady: true,
            access: ['isLabsUser'],
        },
    ],
    access: ['isLabsUser'],
};
