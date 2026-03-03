
import { Directive, AfterViewInit, ElementRef, Input, Renderer2, Inject, DOCUMENT } from "@angular/core";

@Directive({
    selector: "[tmxModalSpinner]",
    standalone: false
})
export class ModalSpinnerDirective implements AfterViewInit {

	@Input() tmxModalSpinner: string;

	constructor(private renderer: Renderer2, private host: ElementRef, @Inject(DOCUMENT) private document: Document) { }

	private domElement: HTMLElement;

	ngAfterViewInit(): void {
		const ele = this.document.getElementsByTagName(this.tmxModalSpinner)[0].parentElement;
		this.domElement = this.host.nativeElement as HTMLElement;
		this.renderer.setStyle(this.domElement, "height", `${ele.clientHeight}px`);
		this.renderer.setStyle(this.domElement, "width", `${ele.clientWidth - 24}px`);
	}
}
