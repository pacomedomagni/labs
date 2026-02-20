import { Directive, AfterViewInit, ElementRef } from "@angular/core";

@Directive({
    selector: "[tmxFocus]",
    standalone: false
})
export class FocusDirective implements AfterViewInit {
	constructor(private host: ElementRef) { }

	ngAfterViewInit(): void {
		this.host.nativeElement.focus();
	}
}
