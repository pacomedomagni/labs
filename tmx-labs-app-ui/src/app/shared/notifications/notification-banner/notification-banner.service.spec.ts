import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, Event } from '@angular/router';
import { NotificationBannerService } from './notification-banner.service';
import { Subject } from 'rxjs';

describe('NotificationBannerService', () => {
  let service: NotificationBannerService;
  let routerEventsSubject: Subject<Event>;

  beforeEach(() => {
    routerEventsSubject = new Subject();
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable(),
      url: '/initial-url'
    });

    TestBed.configureTestingModule({
      providers: [
        NotificationBannerService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    service = TestBed.inject(NotificationBannerService);
  });

  afterEach(() => {
    routerEventsSubject.complete();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('State Signals', () => {
    it('should initialize with empty notifications', () => {
      expect(service.notifications()).toEqual([]);
      expect(service.hasNotifications()).toBe(false);
      expect(service.notificationCount()).toBe(0);
      expect(service.latestNotification()).toBeNull();
    });

    it('should update hasNotifications when notification is added', () => {
      expect(service.hasNotifications()).toBe(false);
      
      service.info('Test message');
      
      expect(service.hasNotifications()).toBe(true);
    });

    it('should update notificationCount correctly', () => {
      expect(service.notificationCount()).toBe(0);
      
      service.info('Message 1');
      expect(service.notificationCount()).toBe(1);
      
      service.success('Message 2');
      expect(service.notificationCount()).toBe(2);
      
      service.warning('Message 3');
      expect(service.notificationCount()).toBe(3);
    });

    it('should return latest notification', () => {
      service.info('First');
      service.success('Second');
      
      const latest = service.latestNotification();
      
      expect(latest).toBeTruthy();
      expect(latest?.message).toBe('Second');
      expect(latest?.type).toBe('success');
    });
  });

  describe('Route Change Behavior', () => {
    it('should dismiss notifications with dismissOnRouteChange: true on route change', (done) => {
      // Add notifications with different dismissOnRouteChange settings
      service.info('Should dismiss', { dismissOnRouteChange: true });
      service.error('Should persist', { dismissOnRouteChange: false });
      service.warning('Should dismiss default'); // defaults to true
      
      expect(service.notificationCount()).toBe(3);
      
      // Trigger route change
      routerEventsSubject.next(new NavigationEnd(1, '/new-route', '/new-route'));
      
      // Use setTimeout to allow effect to run
      setTimeout(() => {
        expect(service.notificationCount()).toBe(1);
        const remaining = service.notifications();
        expect(remaining[0].message).toBe('Should persist');
        expect(remaining[0].type).toBe('error');
        done();
      }, 0);
    });

    it('should not dismiss notifications with dismissOnRouteChange: false', (done) => {
      service.info('Info message', { dismissOnRouteChange: false });
      service.success('Success message', { dismissOnRouteChange: false });
      
      expect(service.notificationCount()).toBe(2);
      
      // Trigger route change
      routerEventsSubject.next(new NavigationEnd(1, '/new-route', '/new-route'));
      
      setTimeout(() => {
        expect(service.notificationCount()).toBe(2);
        done();
      }, 0);
    });

    it('should dismiss all notifications by default on route change', (done) => {
      service.info('Message 1');
      service.success('Message 2');
      service.warning('Message 3');
      
      expect(service.notificationCount()).toBe(3);
      
      // Trigger route change
      routerEventsSubject.next(new NavigationEnd(1, '/another-route', '/another-route'));
      
      setTimeout(() => {
        expect(service.notificationCount()).toBe(0);
        done();
      }, 0);
    });

    it('should handle multiple route changes', (done) => {
      service.info('Persistent 1', { dismissOnRouteChange: false });
      service.info('Dismissible 1');
      
      // First route change
      routerEventsSubject.next(new NavigationEnd(1, '/route1', '/route1'));
      
      setTimeout(() => {
        expect(service.notificationCount()).toBe(1);
        
        service.info('Dismissible 2');
        service.info('Persistent 2', { dismissOnRouteChange: false });
        
        // Second route change
        routerEventsSubject.next(new NavigationEnd(2, '/route2', '/route2'));
        
        setTimeout(() => {
          expect(service.notificationCount()).toBe(2);
          const remaining = service.notifications();
          expect(remaining.every(n => n.dismissOnRouteChange === false)).toBe(true);
          done();
        }, 0);
      }, 0);
    });
  });

  describe('info()', () => {
    it('should create an info notification', () => {
      const id = service.info('Info message');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(id);
      expect(notifications[0].message).toBe('Info message');
      expect(notifications[0].type).toBe('info');
    });

    it('should apply default dismissOnRouteChange: true', () => {
      service.info('Test');
      
      const notification = service.notifications()[0];
      expect(notification.dismissOnRouteChange).toBe(true);
    });

    it('should respect custom dismissOnRouteChange option', () => {
      service.info('Test', { dismissOnRouteChange: false });
      
      const notification = service.notifications()[0];
      expect(notification.dismissOnRouteChange).toBe(false);
    });
  });

  describe('success()', () => {
    it('should create a success notification', () => {
      const id = service.success('Success message');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(id);
      expect(notifications[0].message).toBe('Success message');
      expect(notifications[0].type).toBe('success');
    });
  });

  describe('warning()', () => {
    it('should create a warning notification', () => {
      const id = service.warning('Warning message');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(id);
      expect(notifications[0].message).toBe('Warning message');
      expect(notifications[0].type).toBe('warn');
    });
  });

  describe('error()', () => {
    it('should create an error notification', () => {
      const id = service.error('Error message');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(id);
      expect(notifications[0].message).toBe('Error message');
      expect(notifications[0].type).toBe('error');
    });
  });

  describe('show()', () => {
    it('should create notification with custom type', () => {
      const id = service.show('Custom message', 'info');
      
      const notification = service.notifications()[0];
      expect(notification.id).toBe(id);
      expect(notification.message).toBe('Custom message');
      expect(notification.type).toBe('info');
    });

    it('should add notifications to the beginning of the array', () => {
      service.show('First', 'info');
      service.show('Second', 'success');
      service.show('Third', 'warn');
      
      const notifications = service.notifications();
      expect(notifications[0].message).toBe('Third');
      expect(notifications[1].message).toBe('Second');
      expect(notifications[2].message).toBe('First');
    });

    it('should generate unique IDs', () => {
      const id1 = service.info('Message 1');
      const id2 = service.info('Message 2');
      const id3 = service.info('Message 3');
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should apply custom options', () => {
      const action = { label: 'Retry', callback: jasmine.createSpy('callback') };
      
      service.show('Test', 'info', { 
        dismissable: false,
        dismissOnRouteChange: false,
        action 
      });
      
      const notification = service.notifications()[0];
      expect(notification.dismissable).toBe(false);
      expect(notification.dismissOnRouteChange).toBe(false);
      expect(notification.action).toEqual(action);
    });
  });

  describe('dismiss()', () => {
    it('should remove notification by ID', () => {
      const id1 = service.info('Message 1');
      const id2 = service.success('Message 2');
      const id3 = service.warning('Message 3');
      
      expect(service.notifications().length).toBe(3);
      
      service.dismiss(id2);
      
      expect(service.notifications().length).toBe(2);
      expect(service.getById(id1)).toBeDefined();
      expect(service.getById(id2)).toBeUndefined();
      expect(service.getById(id3)).toBeDefined();
    });

    it('should do nothing if ID does not exist', () => {
      service.info('Message 1');
      
      expect(service.notifications().length).toBe(1);
      
      service.dismiss('non-existent-id');
      
      expect(service.notifications().length).toBe(1);
    });
  });

  describe('dismissAll()', () => {
    it('should remove all notifications', () => {
      service.info('Message 1');
      service.success('Message 2');
      service.warning('Message 3');
      service.error('Message 4');
      
      const notifications = service.notifications();
      expect(notifications.length).toBe(3);
      expect(notifications.some((n) => n.message === 'Message 1')).toBeFalse();
      
      service.dismissAll();
      
      expect(service.notifications().length).toBe(0);
      expect(service.hasNotifications()).toBe(false);
    });

    it('should work when no notifications exist', () => {
      expect(service.notifications().length).toBe(0);
      
      service.dismissAll();
      
      expect(service.notifications().length).toBe(0);
    });
  });

  describe('getById()', () => {
    it('should return notification by ID', () => {
      const id = service.info('Test message');
      
      const notification = service.getById(id);
      
      expect(notification).toBeDefined();
      expect(notification?.id).toBe(id);
      expect(notification?.message).toBe('Test message');
    });

    it('should return undefined for non-existent ID', () => {
      service.info('Test message');
      
      const notification = service.getById('non-existent-id');
      
      expect(notification).toBeUndefined();
    });
  });

  describe('Integration: Route Change + Manual Dismiss', () => {
    it('should allow manual dismiss even with dismissOnRouteChange: false', (done) => {
      const id = service.error('Persistent error', { dismissOnRouteChange: false });
      
      expect(service.notificationCount()).toBe(1);
      
      // Route change shouldn't dismiss it
      routerEventsSubject.next(new NavigationEnd(1, '/new-route', '/new-route'));
      
      setTimeout(() => {
        expect(service.notificationCount()).toBe(1);
        
        // Manual dismiss should work
        service.dismiss(id);
        expect(service.notificationCount()).toBe(0);
        done();
      }, 0);
    });

    it('should handle mix of persistent and dismissible notifications', (done) => {
      const persistentId = service.error('Persistent', { dismissOnRouteChange: false });
      service.info('Dismissible 1');
      service.info('Dismissible 2');
      
      expect(service.notificationCount()).toBe(3);
      
      routerEventsSubject.next(new NavigationEnd(1, '/route', '/route'));
      
      setTimeout(() => {
        expect(service.notificationCount()).toBe(1);
        expect(service.getById(persistentId)).toBeDefined();
        done();
      }, 0);
    });
  });
});