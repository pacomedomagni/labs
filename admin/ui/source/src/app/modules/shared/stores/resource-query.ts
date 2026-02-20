import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Resource } from "../data/resources";

import { MessageCode } from "../data/enums";

@Injectable()
export class ResourceQuery {

	private searchError: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
	searchError$: Observable<string> = this.searchError.asObservable();

	constructor() { }

	updateSearchError(resource: any): void {
		const adj = resource?.length === undefined ? resource : resource[0];
		const hasError = adj === undefined ? false :
			(adj?.messages === undefined ? false : adj?.messages["Error"] !== undefined);
		if (hasError) {
			this.searchError.next(adj.messages["Error"]);
		}
		else {
			this.searchError.next(undefined);
		}
	}

	getExtender(resource: Resource, extender: string): any {
		return resource?.extenders ? resource.extenders[extender] : undefined;
	}

	getMessage(resource: Resource, message: MessageCode): string {
		return resource?.messages ? resource.messages[MessageCode[message]] : undefined;
	}

}
