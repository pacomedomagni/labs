import { BehaviorSubject, Observable } from "rxjs";

import { inject, Injectable } from "@angular/core";
import { map, tap } from "rxjs/operators";
import { ApiService } from "../api/api.service";
import { CookieService } from "ngx-cookie-service";
import { UserInfo } from "../../data/application/resources";

@Injectable({ providedIn: "root" })
export class UserInfoService {
	private readonly controller = "/customerService/roles";

	private api = inject(ApiService);
	private cookieService = inject(CookieService);

	userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>({} as UserInfo);
	userInfo$: Observable<UserInfo> = this.userInfo.asObservable();

	get data(): UserInfo {
		return this.userInfo.value;
	}

	getUserInfo(): Observable<UserInfo> {
		return this.api.get<any>({ uri: `${this.controller}`, options: { fullResponse: true } })
			.pipe(
				tap(x => {
					this.userInfo.next(x.body as UserInfo);
					this.cookieService.set("tmxuser", this.data.name, 1);
				}),
				map(x => x.body as UserInfo));
	}

	getUserAccess(access: string[]): boolean {
		const currentUser = this.userInfo.value;
		if (!currentUser || currentUser.lanId === undefined) {
			return false;
		}
		
		if (!access || access.length === 0) {
			return true; // No access restrictions
		}
		
		for (const role of access) {
			if (currentUser[role as keyof UserInfo]) {
				return true;
			}
		}
		return false;
	}

}
