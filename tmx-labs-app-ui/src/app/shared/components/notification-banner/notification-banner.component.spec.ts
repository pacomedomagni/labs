import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmxNotificationBannerComponent } from './notification-banner.component';

describe('NotificationBannerComponent', () => {
  let component: TmxNotificationBannerComponent;
  let fixture: ComponentFixture<TmxNotificationBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmxNotificationBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmxNotificationBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
