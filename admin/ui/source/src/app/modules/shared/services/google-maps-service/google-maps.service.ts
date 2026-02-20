import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ConfigurationSettings } from "@modules/core/services/configuration/config-info";
import { MapMarker } from "@angular/google-maps";

@Injectable({ providedIn: "root" })
export class GoogleMapsService {
	private isApiLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isApiLoaded$ = this.isApiLoaded.asObservable();

	constructor(httpClient: HttpClient) {
		console.log("🚀 ~ GoogleMapsService ~ loading google maps api...");

		const key = ConfigurationSettings.appSettings.apiKeys.googleMaps;
		httpClient
			.jsonp(`https://maps.googleapis.com/maps/api/js?key=${key}`, "callback")
			.subscribe(
				() => {
					this.isApiLoaded.next(true);
				}
			);
	}
}
