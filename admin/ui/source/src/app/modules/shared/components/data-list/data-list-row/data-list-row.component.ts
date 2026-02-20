import {
	Component,
	ElementRef,
	Input,
	OnInit,
	Renderer2,
	TemplateRef,
	ViewChild,
	ViewContainerRef
} from "@angular/core";

// Workaround for no component host tag option
// https://github.com/angular/angular/issues/18877

@Component({
    selector: "tmx-data-list-row",
    templateUrl: "./data-list-row.component.html",
    styleUrls: ["./data-list-row.component.scss"],
    standalone: false
})
export class DataListRowComponent implements OnInit {
	@Input() label: string;
	@Input() labelSpan: number | string;
	@Input() decoratorIcon: string;
	@Input() decoratorIconClass: string;
	@Input() screenReaderLabel: string;
	@Input() rowClass: string;
	@Input() colClass: string;
	@Input() labelHelpKey: string;
	@Input() contentHelpKey: string;

	@ViewChild(TemplateRef, { read: TemplateRef, static: true })
	public template: TemplateRef<void>;

	constructor(
		private readonly renderer2: Renderer2,
		private readonly elementRef: ElementRef<HTMLElement>,
		private readonly viewContainerRef: ViewContainerRef
	) { }

	public ngOnInit(): void {
		const comment = this.renderer2.createComment("tmx-data-list-row");
		const parentNode = this.renderer2.parentNode(this.elementRef.nativeElement);
		this.viewContainerRef.createEmbeddedView(this.template);
		this.renderer2.insertBefore(parentNode, comment, this.elementRef.nativeElement);
		this.renderer2.removeChild(parentNode, this.elementRef.nativeElement);
	}
}
