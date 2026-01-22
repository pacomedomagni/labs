import { Component, Input } from "@angular/core";
import {MatCardModule} from '@angular/material/card';

@Component({
	selector: "tmx-page-header",
	templateUrl: "./page-header.component.html",
	styleUrls: ["./page-header.component.scss"],
	imports: [MatCardModule],
	standalone: true
})

export class PageHeaderComponent {
	@Input() headerText: string;
}
