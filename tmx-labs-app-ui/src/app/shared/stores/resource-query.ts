import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { MessageCode } from "../data/application/enums";
import { Resource } from "../data/application/resources";

@Injectable()
export class ResourceQuery {

	private searchError: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
	searchError$: Observable<string> = this.searchError.asObservable();

	updateSearchError(resource: Resource | Resource[]): void {
		const adj = Array.isArray(resource) ? resource[0] : resource;
		const hasError = adj === undefined ? false :
			(adj?.messages === undefined ? false : adj?.messages["Error"] !== undefined);
		if (hasError) {
			this.searchError.next(adj.messages["Error"]);
		}
		else {
			this.searchError.next(undefined);
		}
	}

	getExtender(resource: Resource, extender: string): unknown {
		return resource?.extenders ? resource.extenders[extender] : undefined;
	}

	getMessage(resource: Resource, message: MessageCode): string {
		return resource?.messages ? resource.messages[MessageCode[message]] : undefined;
	}

}
