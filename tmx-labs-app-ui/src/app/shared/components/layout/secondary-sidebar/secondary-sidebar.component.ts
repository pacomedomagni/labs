import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SecondarySidebarService } from '../../../services/secondary-sidebar/secondary-sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { UserInfoService } from '../../../services/user-info/user-info.service';

@Component({
  selector: 'tmx-secondary-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FaIconComponent],
  templateUrl: './secondary-sidebar.component.html',
  styleUrls: ['./secondary-sidebar.component.scss']
})
export class SecondarySidebarComponent {
    sidebarService = inject(SecondarySidebarService);
    private userInfoService = inject(UserInfoService);
    
    // Convert userInfo$ observable to signal for reactive tracking
    private userInfo = toSignal(this.userInfoService.userInfo$);

    // Filter apps based on user access, similar to Admin's side-nav-bar
    filteredApps = computed(() => {
      const config = this.sidebarService.config();
      const currentUserInfo = this.userInfo(); // Access signal to establish reactive dependency
      
      if (!config || !currentUserInfo) return [];
      
      return config.apps.filter(app => 
        this.userInfoService.getUserAccess(app.access || [])
      );
    });
}
