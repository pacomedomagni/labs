import { Component, OnInit, Type, ViewChild } from "@angular/core";
import { MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { NavigationEnd, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { AppDataService } from "@modules/shared/services/_index";
import { PageTitleService } from "@modules/core/services/_index";
import { SideSheetService } from "@pgr-cla/core-ui-components";
import { filter } from "rxjs/operators";

@UntilDestroy()
@Component({
    selector: "tmx-side-nav-container",
    templateUrl: "./side-nav-container.component.html",
    styleUrls: ["./side-nav-container.component.scss"],
    standalone: false
})

export class SideNavContainerComponent implements OnInit {
	@ViewChild("sidenav", { static: true }) sidenavRef: MatSidenav;
	@ViewChild("sidesheet", { static: true }) sideSheetRef: MatSidenav;
	@ViewChild("content", { static: true }) contentRef: MatSidenavContent;

	selectedSideSheet$: Observable<Type<any>>;
	private subAppCount = 0;

	constructor(
		private sideSheetService: SideSheetService,
		private router: Router,
		public appDataService: AppDataService,
		public pageTitleService: PageTitleService) { }

	ngOnInit(): void {

		this.sideSheetService.register("sideNav", this.sidenavRef, {
			toggleOnResize: true,
			closeOnRoute: false
		});

		this.appDataService.currentAppGroup$.pipe(untilDestroyed(this)).subscribe(x => {
			if (x) {
				this.subAppCount = x.applications.length;
				const sheet = this.sideSheetService.get("sideNav");
				if (this.subAppCount <= 1) {
					sheet.close();
				}
			}
		});
		this.sideSheetService.register("sideSheet", this.sideSheetRef);
		const sideSheet = this.sideSheetService.get("sideSheet");
		this.selectedSideSheet$ = (sideSheet ? sideSheet.selected$ : of(undefined)) as Observable<Type<any>>;
		this.scrollTopOnRoute();
	}

	scrollTopOnRoute(): void {
		this.router.events
			.pipe(
				filter(e => !(e instanceof NavigationEnd)),
				untilDestroyed(this)
			)
			.subscribe((() => {
				this.contentRef.scrollTo({ top: 0, left: 0 });
			}));
	}
}
