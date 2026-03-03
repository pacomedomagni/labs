import { Component } from "@angular/core";
import { LoadingService } from "@modules/core/services/loading/loading.service";

@Component({
    selector: "tmx-spinner",
    templateUrl: "./spinner.component.html",
    standalone: false
})
export class SpinnerComponent {

	constructor(public loadingService: LoadingService) { }

}
