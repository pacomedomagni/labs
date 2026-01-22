import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppDataService } from '../shared/services/app-data-service/app-data.service';
import { UserInfoService } from '../shared/services/user-info/user-info.service';

@Component({
  selector: 'tmx-customer-service',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './customer-service.component.html',
  styleUrl: './customer-service.component.scss'
})
export class CustomerServiceContainerComponent {
  private appDataService = inject(AppDataService);
  private userInfoService = inject(UserInfoService);
}
