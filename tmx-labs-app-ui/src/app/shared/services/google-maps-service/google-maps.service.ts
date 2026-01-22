import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ConfigurationSettings } from "../configuration/config-info";

@Injectable({ providedIn: "root" })
export class GoogleMapsService {
	private httpClient = inject(HttpClient);
	private isApiLoaded = new BehaviorSubject<boolean>(false);
	isApiLoaded$ = this.isApiLoaded.asObservable();

	constructor() {
		const key = ConfigurationSettings.appSettings.apiKeys.googleMaps;
		this.httpClient
			.jsonp(`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker`, "callback")
			.subscribe(
				() => {
					this.isApiLoaded.next(true);
				}
			);
	}
}
