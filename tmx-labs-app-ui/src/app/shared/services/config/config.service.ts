import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { WebguardConfig, WebguardClient, ServicesConfig, LoggingConfig, ConnectionStringsConfig } from '../../data/application/resources';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly controller = "/Config";

  private api = inject(ApiService);
  
    getWebGuardConfig(): Observable<WebguardConfig> {
        return this.api.get<WebguardConfig>({
            uri: `${this.controller}/WebGuard`
            });
        }

    getWebGuardClient(): Observable<WebguardClient> {
        return this.api.get<WebguardClient>({
        uri: `${this.controller}/WebGuardClient`
        });
    }

    getServices(): Observable<ServicesConfig> {
        return this.api.get<ServicesConfig>({
        uri: `${this.controller}/Services`
        });
    }

    getLogging(): Observable<LoggingConfig> {
        return this.api.get<LoggingConfig>({
        uri: `${this.controller}/Logging`
        });
    }

    getDatabaseConfig(): Observable<ConnectionStringsConfig> {
        return this.api.get<ConnectionStringsConfig>({
        uri: `${this.controller}/Database`
        });
    }
}
