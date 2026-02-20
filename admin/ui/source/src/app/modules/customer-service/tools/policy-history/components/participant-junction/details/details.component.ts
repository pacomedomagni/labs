import { Component, Input, OnInit } from "@angular/core";
import { ColumnDefinition, FilterSortEvent, ParticipantJunction } from "@modules/shared/data/resources";

import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { DialogService } from "@modules/shared/services/_index";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";
import { BehaviorSubject, Observable } from "rxjs";
import { DeviceExperience } from "@modules/shared/data/enums";
import { UIFormats } from "@modules/shared/data/ui-format";
import { sortArrayOfObjects } from "@modules/shared/components/filter-sort-paginator/filter-sort-paginator.component";
import { DeviceInfoComponent } from "../device-info/device-info.component";
import { DeviceInfoMobileComponent } from "../device-info-mobile/device-info-mobile.component";
import { PolicyHistoryService } from "../../../services/policy-history.service";

@Component({
    selector: "tmx-policy-history-pj-details",
    templateUrl: "./details.component.html",
    styleUrls: ["./details.component.scss"],
    standalone: false
})
export class ParticipantJunctionDetailsComponent implements OnInit {
	@Input() Data: BehaviorSubject<ParticipantJunction[]>;
	displayedColumns = [
		"changeEffectiveDate",
		"status",
		"reasonCode",
		"ymm",
		"vin",
		"participantSeqID",
		"participantID",
		"participantExternalId",
		"mobileDeviceAliasName",
		"deviceExperienceTypeCode",
		"policyPeriodSeqID",
		"policySuffix",
		"inceptionDate",
		"expirationDate",
		"rateRevision",
		"vehicleSeqID",
		"driverSeqID",
		"deviceSeqID",
		"deviceSerialNumber",
		"pendingDeviceSerialNumber",
		"junctionVersionSeq",
		"scoringAlgorithmCode",
		"systemName"
	];
	columnDefinition: ColumnDefinition[] = [
		{ name: "changeEffectiveDate", label: "Change Effective Date", value: "changeEffectiveDate", format: "DateTime", width: "Large", sortable: true },
		{ name: "status", label: "Status", value: "status", width: "Small" },
		{ name: "reasonCode", label: "Rsn Code", value: "reasonCode", width: "Large" },
		{ name: "ymm", label: "YMM", value: "ymm", width: "Medium" },
		{ name: "vin", label: "VIN", value: "vin", width: "Large" },
		{ name: "participantSeqID", label: "participant SeqID", value: "participantSeqID", width: "Medium" },
		{ name: "participantID", label: "participant ID", value: "participantID", width: "Small" },
		{ name: "participantExternalId", label: "Participant External Id", value: "participantExternalId", width: "Large" },
		{ name: "deviceExperienceTypeCode", label: "Device Experience Type Code", value: "deviceExperienceTypeCode", width: "Medium" },
		{ name: "mobileDeviceAliasName", label: "Mobile Device Alias Name", value: "mobileDeviceAliasName", width: "Large" },
		{ name: "policyPeriodSeqID", label: "policy Period Seq ID", value: "policyPeriodSeqID", width: "Small" },
		{ name: "policySuffix", label: "policy Suffix", value: "policySuffix", width: "Small" },
		{ name: "inceptionDate", label: "Inception Date", value: "inceptionDate", width: "Medium", format: "DateTime" },
		{ name: "expirationDate", label: "Expiration Date", value: "expirationDate", width: "Medium", format: "DateTime" },
		{ name: "rateRevision", label: "Rate Revision", value: "rateRevision", width: "Small" },
		{ name: "vehicleSeqID", label: "vehicle Seq ID", value: "vehicleSeqID", width: "Small" },
		{ name: "driverSeqID", label: "Driver Seq ID", value: "driverSeqID", width: "Small" },
		{ name: "deviceSeqID", label: "Device Seq ID", value: "deviceSeqID", width: "Small", functionName: "openDeviceDetails" },
		{ name: "deviceSerialNumber", label: "Device Serial Number", value: "deviceSerialNumber", width: "Large" },
		{ name: "pendingDeviceSerialNumber", label: "Pending Device Serial Number", value: "pendingDeviceSerialNumber", width: "Large" },
		{ name: "junctionVersionSeq", label: "Junction Version Seq", value: "junctionVersionSeq", width: "Small" },
		{ name: "scoringAlgorithmCode", label: "Scoring Algorithm Code", value: "scoringAlgorithmCode", width: "Small" },
		{ name: "systemName", label: "System Name", value: "systemName", width: "Small" }
	];

	data$: BehaviorSubject<ParticipantJunction[]> = new BehaviorSubject<ParticipantJunction[]>(null);

	totalRows$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
	displayedRows$: Observable<ParticipantJunction[]>;
	formats = UIFormats;

	constructor(
		public enums: EnumService,
		private dialogService: DialogService,
		private policyHistoryService: PolicyHistoryService) {

	}

	ngOnInit(): void {
		this.data$.next(this.Data.value);
	}

	public getServerData(event: FilterSortEvent) {
		event.pageEvent.length = this.Data.value.length ?? 0;

		let filterData = this.filterData(this.Data.value, event);
		let nextData = this.sortData(filterData, event);
		this.data$.next(nextData ?? filterData);
		this.totalRows$.next(this.Data.value.length);
		return event.pageEvent;
	}

	filterData(data: ParticipantJunction[], queryFilter: FilterSortEvent) {
		let returnData = data;
		if (queryFilter?.filters?.length > 0) {
			for (const currentFilter of queryFilter.filters) {
				returnData = returnData.filter(f => f[currentFilter.property] === currentFilter.filter);
			}
		}
		return returnData;
	}

	sortData(data: ParticipantJunction[], event: FilterSortEvent) {
		if (data?.length < 1) { return []; }
		if (!event.sort) {
			return data.slice(
				event.pageEvent.pageIndex * event.pageEvent.pageSize,
				(event.pageEvent.pageIndex + 1) * event.pageEvent.pageSize);
		}

		let sortData = sortArrayOfObjects(data, event.sort.active, event.sort.direction);
		return sortData.slice(
			event.pageEvent.pageIndex * event.pageEvent.pageSize,
			(event.pageEvent.pageIndex + 1) * event.pageEvent.pageSize);
	}

	openDeviceDetails(junctionData: ParticipantJunction): void {
		if (junctionData.deviceExperienceTypeCode === DeviceExperience.Mobile) {
			this.policyHistoryService.getMobileDeviceInfo(junctionData.homeBaseDeviceSeqID).subscribe(x => {
				this.dialogService.openInformationDialog({
					title: `Mobile Device Information`,
					component: DeviceInfoMobileComponent,
					componentData: x,
					width: CUI_DIALOG_WIDTH.MEDIUM
				});
			});
		}
		else {
			this.policyHistoryService.getDeviceInfo(junctionData.deviceSerialNumber).subscribe(x => {
				this.dialogService.openInformationDialog({
					title: "Xirgo Device Information",
					component: DeviceInfoComponent,
					componentData: x,
					width: CUI_DIALOG_WIDTH.LARGE
				});
			});
		}
	}

	callFunction(value: { name: string; value: any }) {
		this[value.name](value.value);
	}
}
