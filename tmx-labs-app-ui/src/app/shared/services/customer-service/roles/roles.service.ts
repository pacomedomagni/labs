import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly controller = "/customerService/Roles";
  private api = inject(ApiService);
}
