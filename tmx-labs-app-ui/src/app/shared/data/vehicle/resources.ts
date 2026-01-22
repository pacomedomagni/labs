import { Resource } from "../application/resources"

export interface VehicleYearsResponse{
    modelYear: string[];
}

export interface VehicleMakesResponse {
    makes: string[];
}

export interface VehicleModelsResponse {
    models: string[];
}

export interface ScoringAlgorithmsResponse{
    scoringAlgorithms: ScoringAlgorithm[];
}

export interface ScoringAlgorithm {
    code: number;
    description: string;
}

export interface AddNewVehicleRequest {
    vehicle: VehicleDetails;
}

export interface VehicleDetails{
    year: number;
    make: string;
    model: string;
    scoringAlgorithm?: ScoringAlgorithm | null;
    vin?: string;
    vehicleSeqID?: number;
}

// export interface Vehicle extends VehicleDetails {
//     vehicleSeqID?: number;
// }


export interface VehicleInformation {
  vehicle: AddVehicleModel;
  scoringAlgorithmCode: number;
}

export interface AddDriverModel {
  driverFirstName?: string;
  driverLastName?: string;
  driverExternalId?: string;
  registrationCode?: string;
}

export interface AddVehicleModel {
  year: number;
  make: string;
  model: string;
  vin?: string;
  vehicleExternalId?: string;
}

export interface UpdateVehicleRequest{
    changedVehicle: VehicleDetails;
}

export interface UpdateVehicleResponse extends Resource {
    changedVehicle?: VehicleDetails | null;
}

