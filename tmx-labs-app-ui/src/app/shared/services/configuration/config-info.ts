import { AuthConfig } from "angular-oauth2-oidc";

export class ConfigurationSettings {
	public static appSettings: IAppConfig;
}

export interface IAppConfig {
	environment: IEnvInfo;
	build: IBuildInfo;
	auth: IAuthConfig;
	apiKeys: IApiKeys;
	connections: IConnectionsConfig;
}

export interface IApiKeys {
	googleMaps: string;
}

export interface IBuildInfo {
	version: string;
	buildId: string;
	buildNumber: string;
	branch: string;
}

export interface IEnvInfo {
	name: string;
	isProduction: boolean;
	prefix: string;
}

export interface IConnectionsConfig {
	apiUrl: string;
	hostUrl: string;
	slot: string;
}

export interface IAuthConfig extends AuthConfig {
	discoveryDoc: string;
}


export interface EnvConfig {
	environment: string;
}
