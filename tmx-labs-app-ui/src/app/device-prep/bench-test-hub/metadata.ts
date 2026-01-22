import { ApplicationGroupIds } from '../../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../../shared/data/application/application.interface';
import { faMicrochip } from '@fortawesome/free-solid-svg-icons';

export const metadata: ApplicationGroupMetadata = {
    id: ApplicationGroupIds.BenchTestHub,
    name: 'Benchtesting Hub',
    description: 'Start, track, and complete benchtesting all in one place.',
    faIcon: faMicrochip,
    isReady: true,
    access: ['isLabsUser'],
};
