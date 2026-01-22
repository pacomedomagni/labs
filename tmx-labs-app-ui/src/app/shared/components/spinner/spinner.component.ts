import { Component, inject } from "@angular/core";
import { LoadingService } from "../../services/infrastructure/loading/loading.service";


@Component({
	selector: "tmx-spinner",
	templateUrl: "./spinner.component.html",
	standalone: true,
	imports: []
})
export class SpinnerComponent {

	public loadingService = inject(LoadingService);

}
