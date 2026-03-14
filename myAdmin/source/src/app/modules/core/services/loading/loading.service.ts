import { BehaviorSubject, Observable } from "rxjs";

import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class LoadingService {
	private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public isLoading$: Observable<boolean> = this.isLoading.asObservable();

	public startLoading(): void {
		this.isLoading.next(true);
	}

	public stopLoading(): void {
		this.isLoading.next(false);
	}

	public toggleLoading(): void {
		const toggle = !this.isLoading.getValue();
		this.isLoading.next(toggle);
	}

}
