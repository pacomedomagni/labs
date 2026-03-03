import { Injectable } from "@angular/core";
import { first } from "rxjs/operators";
import { AppConfigService } from "./config.service";
import { ConfigurationSettings } from "./config-info";
import { EnvConfigService } from "./env-config.service";

@Injectable({ providedIn: "root" })
export class AppLoadService {

	errorMessage: string;

	constructor(private envService: EnvConfigService, private configService: AppConfigService) { }

	initializeApp(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.envService.getEnvConfig()
				.pipe(first())
				.subscribe(x => {
					const appConfigJson = `../assets/config/application.config.json`;
					this.configService.getConfig(appConfigJson)
						.subscribe(async y => {
							const retrievedAppConfig = y.body;
							ConfigurationSettings.appSettings = retrievedAppConfig;
							console.log("🚀 ~ App Settings ~ ", ConfigurationSettings.appSettings);
							resolve(ConfigurationSettings.appSettings);
						});
				});
		});
	}
}
