import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
private readonly controller = "/Health";
private api = inject(ApiService);

	getHealthStatus(): Observable<string> {
		return this.api.get<string>({
			uri: `${this.controller}`
		});
	}
}
