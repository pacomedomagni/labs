
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "tmx-empty-state",
    templateUrl: "./empty-state.component.html",
    styleUrls: ["./empty-state.component.scss"],
    standalone: false
})
export class EmptyStateComponent {
	@Input() icon: string;
	@Input() svgIcon: string;
	@Input() primaryText: string;
	@Input() secondaryText: string;
	@Input() actionButtonType: "primary" | "secondary" = "secondary";
	@Input() actionText: string;
	@Input() actionIcon: string;
	@Input() actionIconAlign: "right" | "left";
	@Output() actionTriggered: EventEmitter<any> = new EventEmitter();

	onAction(): void {
		this.actionTriggered.emit();
	}
}
