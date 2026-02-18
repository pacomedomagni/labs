import { Injectable, signal } from "@angular/core";
import { ApplicationGroupMetadata } from "../../data/application/application.interface";

export interface SecondarySidebarConfig {
  title: string;
  icon?: string;
  svgIcon?: string;
  baseRoute: string;
  apps: ApplicationGroupMetadata[];
}

@Injectable({
    providedIn: 'root'
})
export class SecondarySidebarService {
    private _config = signal<SecondarySidebarConfig | null>(null);
    private isVisible = signal(false);

    readonly config = this._config.asReadonly();
    readonly visible = this.isVisible.asReadonly();

    show(config: SecondarySidebarConfig): void {
        const currentConfig = this._config();
        const hasDifferentBaseRoute = currentConfig?.baseRoute !== config.baseRoute;

        this._config.set(config);

        if (!currentConfig || hasDifferentBaseRoute) {
            this.isVisible.set(false);
        }
    }

    hide(): void {
        this.isVisible.set(false);
        this._config.set(null);
    }

    toggle(): void {
        const cfg = this._config();
        if (!cfg) {
            return;
        }
        this.isVisible.set(!this.isVisible());
    }
}