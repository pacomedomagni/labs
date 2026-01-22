import { Component } from "@angular/core";
import { BenchTestingBoardsComponent } from "./bench-testing-boards/bench-testing-boards.component";
import { LotBenchtestProgressComponent } from "./lot-benchtest-progress/lot-benchtest-progress.component";

@Component({
  selector: "tmx-device-bench-test-hub",
  standalone: true,
  imports: [BenchTestingBoardsComponent, LotBenchtestProgressComponent],
  templateUrl: "./device-bench-test-hub.component.html",
  styleUrls: ["./device-bench-test-hub.component.scss"]
})
export class TmxDeviceBenchTestHubComponent {}
