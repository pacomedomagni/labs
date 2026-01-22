import { AppLoadService } from "./config-load.service";

export function getConfig(configLoadService: AppLoadService): () => Promise<void> {
	return () => configLoadService.initializeApp();
}
