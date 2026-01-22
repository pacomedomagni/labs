import { ApplicationConfig, inject, Injectable } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { Observable } from 'rxjs';
import { Application, Slot } from 'src/app/shared/data/application/resources';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly controller = "/SupportService/Configuration";

  private api = inject(ApiService);
  
    addApplicationConfig(config: ApplicationConfig): Observable<void> {
        return this.api.put<void>({
            uri: `${this.controller}/add`,
            payload: config
        });
    }

    getApplicationConfigByConfigKey(configKey: string, applicationCode: string): Observable<ApplicationConfig[]> {
        return this.api.get<ApplicationConfig[]>({
            uri: `${this.controller}/getApplicationConfigByConfigKey?configKey=${configKey}applicationCode=${applicationCode}`
        });
    }  

    getAllApplications(): Observable<Application[]> {
        return this.api.get<Application[]>({
            uri: `${this.controller}/getAllApplications`
        });
    }  

    getApplicationConfig(applicationCode: number, serverCode: string, slotId: number): Observable<ApplicationConfig[]> {
        return this.api.get<ApplicationConfig[]>({
            uri: `${this.controller}/getAllApplications?applicationCode=${applicationCode}&serverCode=${serverCode}&slotId=${slotId}`
        }); 
    }

    getAllSlots(): Observable<Slot[]> {
        return this.api.get<Slot[]>({
            uri: `${this.controller}/getAllApplications`
        }); 
    }

    getAllServers(): Observable<Slot[]> {
        return this.api.get<Slot[]>({
            uri: `${this.controller}/getAllServers`
        }); 
    }


}
