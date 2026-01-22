import { inject, Injectable } from "@angular/core";
import { first } from "rxjs/operators";
import { ConfigurationSettings } from "./config-info"
import { EnvConfigService } from "./env-config.service";
import { AppConfigService } from "./config.service";

@Injectable({ providedIn: "root" })
export class AppLoadService {
	private envService = inject(EnvConfigService);
	private configService = inject(AppConfigService);

	
	errorMessage: string;

	initializeApp(): Promise<void> {
		return new Promise((resolve) => {
			this.envService.getEnvConfig()
			.pipe(first())
			.subscribe(response => {
				console.log(`Environment: ${response.body.environment}`);
				const appConfigJson = `../appConfig/config.${response.body.environment}.json`;
				this.configService.getConfig(appConfigJson)
					.subscribe(async y => {
						const retrievedAppConfig = y.body;
						ConfigurationSettings.appSettings = retrievedAppConfig;
						console.log("🚀 ~ App Settings ~ ", ConfigurationSettings.appSettings);
						resolve(null);
					});
			})
		});
	}
}
