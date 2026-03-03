import { AppLoadService } from "./config-load.service";

export function getConfig(configLoadService: AppLoadService): () => Promise<any> {
	return () => configLoadService.initializeApp();
}
