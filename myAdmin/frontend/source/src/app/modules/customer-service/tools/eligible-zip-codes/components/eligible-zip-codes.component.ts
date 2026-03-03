import { Component, OnInit } from "@angular/core";
import { StatesDescription } from "@modules/shared/data/enum-descriptions";
import { EligibleZipCode } from "@modules/shared/data/resources";
import { MatTableDataSource } from "@angular/material/table";
import { EligibleZipCodesService } from "../services/eligible-zip-codes.service";

@Component({
    selector: "tmx-eligible-zip-codes",
    templateUrl: "./eligible-zip-codes.component.html",
    styleUrls: ["./eligible-zip-codes.component.scss"],
    standalone: false
})
export class EligibleZipCodesComponent implements OnInit {

	private DEFAULT_MESSAGE = `Please enter a state and/or zip code to begin your search`;
	private NO_ZIP_MESSAGE = `It appears we could not find any zip codes matching your search criteria that are eligible for Snapshot`;

	model: any = {
		state: undefined,
		zipCode: ""
	};

	states: { abbreviation: string; name: string }[] = Array.from(StatesDescription.values());
	dataSource: MatTableDataSource<EligibleZipCode>;
	columns: string[] = ["state", "zipCode"];
	message: string = this.DEFAULT_MESSAGE;

	constructor(private eligibleZipCodesService: EligibleZipCodesService) {

	}

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<EligibleZipCode>();
	}

	shouldDisableSearch(): boolean {

		return this.model.state === undefined && this.model.zipCode === "" ||
			this.model.state === undefined && (this.model.zipCode !== "" && this.model.zipCode.length < 5);
	}

	search(model: any): void {
		this.eligibleZipCodesService.getEligibleZipCodes(model.state?.abbreviation, model.zipCode).subscribe(x => {
			this.dataSource.data = x;
			this.message = x.length === 0 ? this.NO_ZIP_MESSAGE : this.DEFAULT_MESSAGE;
		});
	}
}
