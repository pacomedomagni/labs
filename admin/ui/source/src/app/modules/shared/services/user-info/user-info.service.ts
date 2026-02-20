import { BehaviorSubject, Observable } from "rxjs";

import { ApiService } from "@modules/core/services/_index";
import { Injectable } from "@angular/core";
import { UserInfo } from "@modules/shared/data/resources";
import { map, tap } from "rxjs/operators";
import { CookieService } from "ngx-cookie-service";

@Injectable({ providedIn: "root" })
export class UserInfoService {
	private readonly controller = "/customerService/roles";

	userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>({} as UserInfo);
	userInfo$: Observable<UserInfo> = this.userInfo.asObservable();

	constructor(private api: ApiService, private cookieService: CookieService) {
	}

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
		if (this.userInfo.value.lanId !== undefined) {
			let returnValue = false;
			for (let index in access) {
				if (this.userInfo.value[access[index]]) {
					returnValue = true;
					break;
				}
			}
			return returnValue;
		}
		else {
			return false;
		}
	}

}
