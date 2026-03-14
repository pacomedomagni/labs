import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to manage automatic and manual reloading of device orders.
 * Emits reload events on a 10-minute interval and provides manual reload capability.
 */
@Injectable({
  providedIn: 'root'
})
export class DeviceOrderReloadService implements OnDestroy {
  private readonly REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  private refreshInterval?: number;
  private reloadSubject = new Subject<boolean>();

  /**
   * Observable that emits when device orders should be reloaded.
   * Emits automatically every 10 minutes and when manually triggered.
   * When true is emitted, it indicates a manual trigger; when false is emitted, it indicates an automatic trigger.
   */
  readonly reload$ = this.reloadSubject.asObservable();

  constructor() {
    this.startAutoReload();
  }

  /**
   * Manually trigger a reload of device orders.
   */
  triggerReload(): void {
    this.reloadSubject.next(true);
  }

  /**
   * Start the automatic reload interval (10 minutes).
   */
  private startAutoReload(): void {
    if (this.refreshInterval) {
      return; // Already started
    }

    this.refreshInterval = window.setInterval(() => {
      this.reloadSubject.next(false);
    }, this.REFRESH_INTERVAL_MS);
  }

  /**
   * Stop the automatic reload interval.
   */
  private stopAutoReload(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoReload();
    this.reloadSubject.complete();
  }
}
