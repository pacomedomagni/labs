import { NotificationBannerService } from "../shared/notifications/notification-banner/notification-banner.service";
import { UserInfoService } from "../shared/services/user-info/user-info.service";
import { RoleTestingComponent } from "./role-testing.component";

function setup() {
	const userInfoService: Partial<UserInfoService> = {
		getUserInfo: jest.fn(),
		userInfo: { next: jest.fn() } as any
	};
	const notificationService: Partial<NotificationBannerService> = {
		success: jest.fn()
	};
	const builder = {
		userInfoService,
		notificationService,
		default() {
			return builder;
		},
		build() {
			return new RoleTestingComponent(userInfoService as UserInfoService, notificationService as NotificationBannerService);
		}
	};

	return builder;
}

describe("RoleTestingComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});


    expect(component.loadError()).toBeTrue();
    const errorMessage: HTMLElement | null = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage?.textContent).toContain('Unable to retrieve user roles');
    expect(notificationService.error).toHaveBeenCalledWith('Unable to retrieve user roles');

    const okButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(okButton.disabled).toBeTrue();
  });
});
