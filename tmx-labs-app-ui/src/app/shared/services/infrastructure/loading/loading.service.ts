import { Injectable, Signal, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class LoadingService {
	private _isLoading = signal(false);

	public get isLoading(): Signal<boolean> {
		return this._isLoading.asReadonly();
	}

	public startLoading(): void {
		this._isLoading.set(true);
	}

	public stopLoading(): void {
		this._isLoading.set(false);
	}

	public toggleLoading(): void {
		const toggle = !this.isLoading();
		this._isLoading.set(toggle);
	}

}
