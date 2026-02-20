import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { SelectListItem } from "@modules/shared/components/form-controls/select-control/select-control.component";
import { DateControlComponent, DateTimeControlComponent, GuidControlComponent, NumericControlComponent, PhoneNumberControlComponent, TextControlComponent } from "@modules/shared/components/form-controls/_index";
import { ControlTypes } from "@modules/shared/data/control-types";

@Component({
    selector: "tmx-input-controls",
    templateUrl: "./input-controls.component.html",
    styleUrls: ["./input-controls.component.scss"],
    standalone: false
})
export class InputControlsComponent implements OnInit, AfterViewInit {

	@ViewChild(TextControlComponent) textControl: TextControlComponent;
	@ViewChild(GuidControlComponent) guidControl: GuidControlComponent;
	@ViewChild(DateControlComponent) dateControl: DateControlComponent;
	@ViewChild(DateTimeControlComponent) dateTimeControl: DateTimeControlComponent;
	@ViewChild(NumericControlComponent) numericControl: NumericControlComponent;
	@ViewChild(PhoneNumberControlComponent) phoneControl: PhoneNumberControlComponent;

	componentProperties = ["id", "isDisabled", "isRequired", "name", "label", "mask", "min", "max", "minlength", "maxlength", "model", "step"];
	controlTypes = ControlTypes;
	controlMap = new Map<ControlTypes, InputControl>([
		[
			ControlTypes.Date,
			{
				model: undefined,
				id: "DateId",
				label: "Date Control"
			}
		],
		[
			ControlTypes.DateTime,
			{
				model: undefined,
				id: "DateTimeId",
				name: "DateTimeName",
				label: "Date Time Control"
			}
		],
		[
			ControlTypes.Guid,
			{
				model: undefined,
				id: "GuidId",
				label: "Guid Control"
			}
		],
		[
			ControlTypes.Numeric,
			{
				model: undefined,
				id: "NumericId",
				name: "NumericName",
				label: "Numeric Control"
			}
		],
		[
			ControlTypes.PhoneNumber,
			{
				model: undefined,
				id: "PhoneId",
				label: "Phone Control"
			}
		],
		[
			ControlTypes.Text,
			{
				model: undefined,
				id: "TextId",
				name: "TextName",
				label: "Text Control"
			}
		]
	]);
	controlOptions: SelectListItem<ControlTypes>[] = [
		{ value: ControlTypes.Date },
		{ value: ControlTypes.DateTime },
		{ value: ControlTypes.Guid },
		{ value: ControlTypes.Numeric },
		{ value: ControlTypes.PhoneNumber },
		{ value: ControlTypes.Text }
	];
	selectedControlType: ControlTypes;
	selectedControl: InputControl;
	selectedComponent: any;

	constructor() { }

	ngOnInit(): void {
		this.selectedControlType = ControlTypes.Date;
		this.onControlChange(this.selectedControlType);
	}

	ngAfterViewInit(): void {
		this.onControlChange(this.selectedControlType);
	}

	testOnChange(data: any): void {
		console.log(data);
	}

	testKeydown(data: any): void {
		console.log(data);
	}

	onControlChange(controlType: ControlTypes): void {
		this.selectedControl = this.controlMap.get(controlType);
		switch (this.selectedControlType) {
			case ControlTypes.Date:
				this.selectedComponent = this.dateControl;
				break;
			case ControlTypes.DateTime:
				this.selectedComponent = this.dateTimeControl;
				break;
			case ControlTypes.Guid:
				this.selectedComponent = this.guidControl;
				break;
			case ControlTypes.Numeric:
				this.selectedComponent = this.numericControl;
				break;
			case ControlTypes.PhoneNumber:
				this.selectedComponent = this.phoneControl;
				break;
			case ControlTypes.Text:
				this.selectedComponent = this.textControl;
				break;
		}
	}
}

export class InputControl {
	id: string;
	label: string;
	model: any;
	name?: string;
	isRequired?: boolean;
	isDisabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	minlength?: number;
	maxlength?: number;
	minNumber?: number;
	maxNumber?: number;
	step?: number;
}
