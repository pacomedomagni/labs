import { Component, inject, Signal } from '@angular/core';
import { NotificationBannerService } from '../../notifications/notification-banner/notification-banner.service';
import { Notification } from '../../notifications/notification-banner/notification-banner.service';
import { NotificationBannerComponent } from '@pgr-cla/core-ui-components';

@Component({
    selector: 'tmx-notification-banner',
    imports: [NotificationBannerComponent],
    templateUrl: './notification-banner.component.html',
    styleUrl: './notification-banner.component.scss',
})
export class TmxNotificationBannerComponent {
    private notificationService = inject(NotificationBannerService);
    notifications: Signal<Notification[]> = this.notificationService.notifications;

    dismissNotification(notificationId: string) {
        this.notificationService.dismiss(notificationId);
    }

    pauseTimer(notificationId: string) {
        this.notificationService.pauseAutoDismiss(notificationId);
    }

    resumeTimer(notificationId: string) {
        this.notificationService.resumeAutoDismiss(notificationId);
    }

    getTimerState(notificationId: string) {
        return this.notificationService.getTimerState(notificationId);
    }
}
