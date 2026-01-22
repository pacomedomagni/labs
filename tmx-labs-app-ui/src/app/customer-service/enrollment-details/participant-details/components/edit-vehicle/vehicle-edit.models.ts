import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';

export interface VehicleEditResult {
    vehicle: VehicleDetails;
}

export interface VehicleEditData {
    vehicleDetails: VehicleEditResult;
    displayScoringAlgorithm: boolean;
}
 