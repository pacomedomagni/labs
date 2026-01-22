// import { Event, Router } from "@angular/router";

// import { PageTitleService } from "@modules/core/services/_index";
// import { autoSpy } from "autoSpy";
// import { Observable, of } from "rxjs";
// import { UserInfo } from "@modules/shared/data/resources";
// import { AppDataService } from "./app-data.service";
// import { UserInfoService } from "../_index";

// function setup() {
// 	const document = autoSpy(Document);
// 	const router = autoSpy(Router);
// 	const userService = autoSpy(UserInfoService);
// 	Object.defineProperty(router, "events", { value: of([] as Event[]) });
// 	const pageTitleService = autoSpy(PageTitleService);
// 	const builder = {
// 		document,
// 		router,
// 		pageTitleService,
// 		userService,
// 		default() {
// 			userService.userInfo$ = new Observable<UserInfo>();
// 			return builder;
// 		},
// 		build() {
// 			return new AppDataService(document, router, pageTitleService, userService);
// 		}
// 	};

// 	return builder;
// }

// describe("AppDataService", () => {

// 	it("should create", () => {
// 		const { build } = setup().default();
// 		const component = build();
// 		expect(component).toBeTruthy();
// 	});

// });

