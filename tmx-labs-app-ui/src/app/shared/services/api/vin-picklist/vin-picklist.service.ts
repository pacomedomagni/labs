import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { VehicleYearsResponse, VehicleMakesResponse, VehicleModelsResponse, ScoringAlgorithmsResponse } from 'src/app/shared/data/vehicle/resources';

@Injectable({
  providedIn: 'root'
})
export class VinPicklistService {
  private readonly controller = "/Vehicle/VinPicklist";
  private api = inject(ApiService);
   
    getVehicleYears(): Observable<VehicleYearsResponse> {
      return this.api.get<VehicleYearsResponse>({
          uri: `${this.controller}/Years`,
      });
    }

    getVehicleMakes(year: string): Observable<VehicleMakesResponse> {
      return this.api.get<VehicleMakesResponse>({
          uri: `${this.controller}/Makes?year=${year}`,
      });
    }

    getVehicleModels(year: string, make: string): Observable<VehicleModelsResponse> {
      return this.api.get<VehicleModelsResponse>({
          uri: `${this.controller}/Models?year=${year}&make=${make}`,
      });
    }
    
    getScoringAlgorithms(): Observable<ScoringAlgorithmsResponse> {
      return this.api.get<ScoringAlgorithmsResponse>({
          uri: `${this.controller}/ScoringAlgorithms`,
      });
    }
}
