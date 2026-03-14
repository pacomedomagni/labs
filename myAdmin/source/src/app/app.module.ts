import { BrowserModule, DomSanitizer } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AuthModule } from "@modules/auth/auth.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CoreModule } from "@modules/core/core.module";
import { MatIconRegistry } from "@angular/material/icon";
import { SharedModule } from "@modules/shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		BrowserAnimationsModule,
		AuthModule,
		CoreModule,
		SharedModule
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
		const icons = [
			["ubi_progressive_p", "logo-p.svg"],
			["ubi_progressive_logo", "logo-progressive.svg"],
			["ubi_sadcone", "sadCone.svg"],
			["ubi_snapshot_mobile", "snapshot_phoneuse.svg"],
			["ubi_snapshot_device", "snapshot_plugin.svg"],
			["ubi_snapshot_trip", "snapshot_total_trips.svg"],
			["ubi_home", "home.svg"],
			["ubi_search", "search.svg"],
			["tel_mobile", "tel_mobile.svg"],
			["tel_plugin", "tel_plugin.svg"]
		];
		icons.forEach(x => this.addMatIcon(x[0], x[1]));
	}

	addMatIcon(iconName: string, fileName: string): void {
		this.matIconRegistry.addSvgIcon(
			iconName,
			this.domSanitizer.bypassSecurityTrustResourceUrl(`../assets/${fileName}`)
		);
	}
}

