import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
export class JsonDateInterceptor implements HttpInterceptor {

	private isoDateFormat = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/;

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(map((val: HttpEvent<any>) => {
			if (val instanceof HttpResponse) {
				const body = val.body;
				this.convert(body);
			}
			return val;
		}));
	}

	isIsoDateString(value: any): boolean {
		if (value === null || value === undefined) {
			return false;
		}

		if (typeof value === "string") {
			return this.isoDateFormat.test(value);
		}

		return false;
	}

	convert(body: any): any {
		if (body === null || body === undefined) {
			return body;
		}
		if (typeof body !== "object") {
			return body;
		}
		for (const key of Object.keys(body)) {
			const value = body[key];
			if (this.isIsoDateString(value)) {
				body[key] = new Date(value);
			} else if (typeof value === "object") {
				this.convert(value);
			}
		}
	}
}
