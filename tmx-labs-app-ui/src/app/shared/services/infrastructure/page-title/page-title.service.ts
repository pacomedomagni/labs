import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Injectable({providedIn: 'root'})
export class PageTitleService {
	private currentTitle = "";

	get title(): string { return this.currentTitle; }

	set title(title: string) {
		this.currentTitle = title;
		this.titleService.setTitle(`${title ? `${title} ❘ ` : ""}TMX Labs`);
	}

	private titleService = inject(Title);
}
