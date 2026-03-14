import { Injectable, SecurityContext } from "@angular/core";

import { DomSanitizer } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class StaticDataService {

	constructor(
		private httpClient: HttpClient,
		private domSanitizer: DomSanitizer
	) { }

	getStaticHTML(url: string, isTrusted: boolean): Observable<string> {
		return this.httpClient.get(url, {
			responseType: "text"
		}).pipe(
			map(response => this.mapStaticHtml(response, isTrusted))
		);
	}

	private mapStaticHtml(htmlString: string, isTrusted: boolean): string {

		return isTrusted ?
			htmlString :
			this.domSanitizer.sanitize(SecurityContext.HTML, htmlString);
	}
}
