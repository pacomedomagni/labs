import { Component, inject, signal, OnInit, OnDestroy } from "@angular/core";
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { AppDataService } from "../shared/services/app-data-service/app-data.service";
import { UserInfoService } from "../shared/services/user-info/user-info.service";
import { applicationGroups } from "./device-prep-applications-metadata";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ApplicationGroupMetadata } from "../shared/data/application/application.interface";
import { Subject } from "rxjs";
import { takeUntil, filter } from "rxjs/operators";

@Component({
  selector: "tmx-device-prep",
  standalone: true,
  imports: [RouterModule, MatIconModule, FaIconComponent],
  templateUrl: "./device-prep.component.html",
  styleUrl: "./device-prep.component.scss"
})
export class DevicePrepComponent implements OnInit, OnDestroy {
  private appDataService = inject(AppDataService);
  private userInfoService = inject(UserInfoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  apps = applicationGroups;
  showCards = signal(true);

  ngOnInit() {
    // Subscribe to router navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateShowCards();
    });
    // Initial check
    this.updateShowCards();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateShowCards() {
    const hasActiveChild = !!this.route.firstChild;
    this.showCards.set(!hasActiveChild);
  }

    shouldDisplay(app: ApplicationGroupMetadata): boolean {
        return this.appDataService.shouldDisplayApplication(app) &&
          this.userInfoService.getUserAccess(app.access);
      }
}
