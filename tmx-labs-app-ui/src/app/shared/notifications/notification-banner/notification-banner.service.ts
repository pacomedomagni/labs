import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NotificationBannerType } from '@pgr-cla/core-ui-components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Notification interface
 */
export interface Notification {
    id: string;
    message: string;
    type: NotificationBannerType;
    dismissable?: boolean;
    dismissOnRouteChange?: boolean;
    duration?: number; // Duration in milliseconds, 0 = no auto-dismiss
    action?: {
        label: string;
        callback: () => void;
    };
    timestamp: Date;
}

/**
 * Service for managing notification banners
 */
@Injectable({ providedIn: 'root' })
export class NotificationBannerService {
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    private readonly MAX_NOTIFICATIONS = 3;
    private readonly DEFAULT_SUCCESS_DURATION = 10000; // 10 seconds
    private readonly DEFAULT_ERROR_DURATION = 30000; // 30 seconds

    // Track active timers for auto-dismissal
    private readonly activeTimers = new Map<string, ReturnType<typeof setTimeout>>();
    
    // Track when timers were started to calculate remaining time
    private readonly timerStartTimes = new Map<string, { startTime: Date; duration: number }>();
    
    // Track paused timers with their remaining time and pause timestamp
    private readonly pausedTimers = new Map<string, { remainingTime: number; pausedAt: Date }>();

    // #region State
    private readonly _notifications = signal<Notification[]>([]);
    private _nextId = 0;

    /**
     * Read-only signal of all notifications
     */
    readonly notifications = this._notifications.asReadonly();

    /**
     * Whether there are any active notifications
     */
    readonly hasNotifications = computed(() => this._notifications().length > 0);

    /**
     * Count of active notifications
     */
    readonly notificationCount = computed(() => this._notifications().length);

    /**
     * Most recent notification
     */
    readonly latestNotification = computed(() => {
        const notifications = this._notifications();
        return notifications.length > 0 ? notifications[0] : null;
    });
    // #endregion

    constructor() {
        // Subscribe to route changes
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                // Dismiss all notifications that should be dismissed on route change
                this._notifications.update((notifications) =>
                    notifications.filter((n) => n.dismissOnRouteChange === false),
                );
            });

        // Clean up timers when service is destroyed
        this.destroyRef.onDestroy(() => {
            this.clearAllTimers();
        });
    }

    // #region Public Methods
    /**
     * Show an info notification
     */
    info(message: string, options?: Partial<Notification>): string {
        return this.show(message, 'info', {
            ...options,
            duration: options?.duration ?? this.DEFAULT_SUCCESS_DURATION,
        });
    }

    /**
     * Show a success notification
     */
    success(message: string, options?: Partial<Notification>): string {
        return this.show(message, 'success', {
            ...options,
            duration: options?.duration ?? this.DEFAULT_SUCCESS_DURATION,
        });
    }

    /**
     * Show a warning notification
     */
    warning(message: string, options?: Partial<Notification>): string {
        return this.show(message, 'warn', {
            ...options,
            duration: options?.duration ?? this.DEFAULT_ERROR_DURATION,
        });
    }

    /**
     * Show an error notification
     */
    error(message: string, options?: Partial<Notification>): string {
        return this.show(message, 'error', {
            ...options,
            duration: options?.duration ?? this.DEFAULT_ERROR_DURATION,
        });
    }

    /**
     * Show a persistent notification that doesn't auto-dismiss
     */
    persistent(
        message: string,
        type: NotificationBannerType,
        options?: Partial<Notification>,
    ): string {
        return this.show(message, type, { ...options, duration: 0 });
    }

    /**
     * Show a notification with custom severity
     */
    show(message: string, type: NotificationBannerType, options?: Partial<Notification>): string {
        const id = this.generateId();
        const duration = options?.duration ?? this.DEFAULT_SUCCESS_DURATION;

        const notification: Notification = {
            id,
            message,
            type,
            dismissable: options?.dismissable ?? true,
            dismissOnRouteChange: options?.dismissOnRouteChange ?? true,
            duration,
            action: options?.action,
            timestamp: new Date(),
        };

        if (this._notifications().length >= this.MAX_NOTIFICATIONS) {
            // Remove the oldest notification and its timer
            const notifications = this._notifications();
            const oldestNotification = notifications[notifications.length - 1];
            if (oldestNotification) {
                this.clearTimer(oldestNotification.id);
            }

            this._notifications.update((notifications) =>
                notifications.slice(0, this.MAX_NOTIFICATIONS - 1),
            );
        }

        this._notifications.update((notifications) => [notification, ...notifications]);

        // Set up auto-dismiss timer if duration > 0
        if (duration > 0) {
            this.setAutoDismissTimer(id, duration);
        }

        return id;
    }

    /**
     * Dismiss a notification by ID
     */
    dismiss(id: string): void {
        this.clearTimer(id);
        this._notifications.update((notifications) => notifications.filter((n) => n.id !== id));
    }

    /**
     * Dismiss all notifications
     */
    dismissAll(): void {
        this.clearAllTimers();
        this._notifications.set([]);
    }

    /**
     * Get a notification by ID
     */
    getById(id: string): Notification | undefined {
        return this._notifications().find((n) => n.id === id);
    }

    /**
     * Update the duration of an existing notification
     */
    updateDuration(id: string, duration: number): void {
        const notification = this.getById(id);
        if (!notification) return;

        // Clear existing timer
        this.clearTimer(id);

        // Update the notification
        this._notifications.update((notifications) =>
            notifications.map((n) => (n.id === id ? { ...n, duration } : n)),
        );

        // Set new timer if duration > 0
        if (duration > 0) {
            this.setAutoDismissTimer(id, duration);
        }
    }

    /**
     * Pause auto-dismiss for a notification (useful for hover states)
     */
    pauseAutoDismiss(id: string): void {
        const notification = this.getById(id);
        if (!notification || !this.activeTimers.has(id)) return;


        // Calculate remaining time based on elapsed time since timer started
        const timerInfo = this.timerStartTimes.get(id);
        if (timerInfo) {
            const elapsed = Date.now() - timerInfo.startTime.getTime();
            const remainingTime = Math.max(0, timerInfo.duration - elapsed);
            
            this.pausedTimers.set(id, {
                remainingTime,
                pausedAt: new Date()
            });
            
            this.clearTimer(id);
        }
    }

    /**
     * Resume auto-dismiss for a notification with remaining time
     */
    resumeAutoDismiss(id: string, remainingDuration?: number): void {
        const notification = this.getById(id);
        if (!notification) return;

        let duration = remainingDuration;
        
        // If no explicit duration provided, use paused timer data
        if (duration === undefined) {
            const pausedTimer = this.pausedTimers.get(id);
            if (pausedTimer) {
                duration = pausedTimer.remainingTime;
                this.pausedTimers.delete(id);
            } else {
                duration = notification.duration ?? this.DEFAULT_SUCCESS_DURATION;
            }
        } else {
            // Clear any paused timer data since explicit duration was provided
            this.pausedTimers.delete(id);
        }

        if (duration > 0) {
            this.setAutoDismissTimer(id, duration);
        }
    }

    getTimerState(notificationId: string): 'running' | 'paused' | null {
        const notification = this.getById(notificationId);
        if (!notification || !notification.duration || notification.duration === 0) return null;

        if (this.activeTimers.has(notificationId)) {
            return 'running';
        } else if (this.pausedTimers.has(notificationId)) {
            return 'paused';
        } else {
            return null;
        }
    }

    /**
     * Get the remaining time in milliseconds for a notification
     */
    getRemainingTime(notificationId: string): number {
        const notification = this.getById(notificationId);
        if (!notification || !notification.duration || notification.duration === 0) {
            return 0;
        }

        // Check if timer is paused
        const pausedTimer = this.pausedTimers.get(notificationId);
        if (pausedTimer) {
            return pausedTimer.remainingTime;
        }

        // Check if timer is active
        const timerInfo = this.timerStartTimes.get(notificationId);
        if (timerInfo && this.activeTimers.has(notificationId)) {
            const elapsed = Date.now() - timerInfo.startTime.getTime();
            return Math.max(0, timerInfo.duration - elapsed);
        }

        // Timer not active, return full duration
        return notification.duration;
    }

    /**
     * Get the remaining time as a percentage (0-100)
     */
    getRemainingTimePercentage(notificationId: string): number {
        const notification = this.getById(notificationId);
        if (!notification || !notification.duration || notification.duration === 0) {
            return 0;
        }

        const remaining = this.getRemainingTime(notificationId);
        return Math.max(0, Math.min(100, (remaining / notification.duration) * 100));
    }

    /**
     * Get the elapsed time in milliseconds for a notification
     */
    getElapsedTime(notificationId: string): number {
        const notification = this.getById(notificationId);
        if (!notification || !notification.duration || notification.duration === 0) {
            return 0;
        }

        const remaining = this.getRemainingTime(notificationId);
        return notification.duration - remaining;
    }

    /**
     * Get remaining time in a human-readable format (e.g., "5.2s", "1.3m")
     */
    getRemainingTimeFormatted(notificationId: string): string {
        const remainingMs = this.getRemainingTime(notificationId);
        
        if (remainingMs === 0) {
            return '0s';
        }

        const seconds = remainingMs / 1000;
        
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        } else {
            const minutes = seconds / 60;
            return `${minutes.toFixed(1)}m`;
        }
    }

    // #endregion

    // #region Private Methods
    /**
     * Generate a unique notification ID
     */
    private generateId(): string {
        return `notification-${++this._nextId}-${Date.now()}`;
    }

    /**
     * Set up auto-dismiss timer for a notification
     */
    private setAutoDismissTimer(id: string, duration: number): void {
        // Clear any existing timer for this notification
        this.clearTimer(id);

        // Record when this timer started
        this.timerStartTimes.set(id, {
            startTime: new Date(),
            duration
        });

        // Set new timer
        const timerId = setTimeout(() => {
            this.dismiss(id);
        }, duration);

        this.activeTimers.set(id, timerId);
    }

    /**
     * Clear timer for a specific notification
     */
    private clearTimer(id: string): void {
        const timerId = this.activeTimers.get(id);
        if (timerId) {
            clearTimeout(timerId);
            this.activeTimers.delete(id);
        }
    }

    /**
     * Clear all active timers
     */
    private clearAllTimers(): void {
        this.activeTimers.forEach((timerId) => clearTimeout(timerId));
        this.activeTimers.clear();
        this.timerStartTimes.clear();
        this.pausedTimers.clear();
    }
    // #endregion
}
