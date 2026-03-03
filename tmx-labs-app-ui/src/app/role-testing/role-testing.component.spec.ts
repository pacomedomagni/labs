import { NotificationBannerService } from "../shared/notifications/notification-banner/notification-banner.service";
import { UserInfoService } from "../shared/services/user-info/user-info.service";
import { RoleTestingComponent } from "./role-testing.component";

function setup() {
	const userInfoService: Partial<UserInfoService> = {
		getUserInfo: jasmine.createSpy('getUserInfo'),
		userInfo: { next: jasmine.createSpy('userInfo.next') } as any
	};
	const notificationService: Partial<NotificationBannerService> = {
		success: jasmine.createSpy('success')
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
