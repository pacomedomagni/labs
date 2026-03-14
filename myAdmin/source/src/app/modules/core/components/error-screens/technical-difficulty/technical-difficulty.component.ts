import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Data } from "@angular/router";
import { take } from "rxjs/operators";

@Component({
    selector: "tmx-techdiff",
    templateUrl: "./technical-difficulty.component.html",
    styleUrls: ["./technical-difficulty.component.scss"],
    standalone: false
})
export class TechnicalDifficultyComponent implements OnInit {
	@Input() helpDeskNumber = "888-746-4500";
	public title = "Oops! Something went wrong!";
	public message = "Looks like something went wrong loading the page.";

	constructor(
		private route: ActivatedRoute,
		@Optional() @Inject(MAT_DIALOG_DATA) public dialogData: Data
	) { }

	ngOnInit(): void {
		this.route.data.pipe(take(1)).subscribe((routeData: Data) => {
			if (this.dialogData && this.dialogData.title && this.dialogData.message) {
				this.title = this.dialogData.title;
				this.message = this.dialogData.message;
				this.helpDeskNumber = this.dialogData.helpDeskNumber !== undefined ?
					this.dialogData.helpDeskNumber :
					this.helpDeskNumber;
			} else if (routeData && routeData.title && routeData.message) {
				this.title = routeData.title;
				this.message = routeData.message;
				this.helpDeskNumber = routeData.helpDeskNumber !== undefined ?
					routeData.helpDeskNumber :
					this.helpDeskNumber;
			}
		});
	}
}
