import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { BaseFormComponent } from "@modules/shared/components/form-controls/base-form";
import { ControlTypes } from "@modules/shared/data/control-types";
import { SPParameter } from "@modules/shared/data/resources";
import { UserInfoService } from "@modules/shared/services/user-info/user-info.service";

@Component({
    selector: "tmx-stored-procedure-parm-input",
    templateUrl: "./stored-procedure-parm-input.component.html",
    styleUrls: ["./stored-procedure-parm-input.component.scss"],
    standalone: false
})

export class StoredProcedureParmInputComponent extends BaseFormComponent implements OnInit {

	@Input() model: SPParameter[];

	controlTypes = ControlTypes;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any,
		private userInfo: UserInfoService
	) { super(injectedData); }

	ngOnInit(): void {
		super.ngOnInit();
		this.model = this.model || this.injectedData.model;
		this.model.forEach(x => {
			if (x.name.toLowerCase() === "@parm_username") {
				x.value = this.userInfo.data.lanId;
			}
		});
	}

	getLabel(sp: SPParameter): string {
		return sp.name.replace("@Parm_", "");
	}

	isTextControl(dbType: string): boolean {
		const ctrlType = this.getControlEnumType(dbType);
		return ctrlType === ControlTypes.Text || ctrlType === ControlTypes.Guid;
	}

	isNumericControl(dbType: string): boolean {
		return this.getControlEnumType(dbType) === ControlTypes.Numeric;
	}

	isDateControl(dbType: string): boolean {
		return this.getControlEnumType(dbType) === ControlTypes.DateTime;
	}

	isGuidControl(dbType: string): boolean {
		return this.getControlEnumType(dbType) === ControlTypes.Guid;
	}

	isPhoneNumberControl(sp: SPParameter): boolean {
		return ["MOBILENUMBER", "PHONENUMBER"].includes(this.getLabel(sp).toUpperCase());
			}

	private getControlEnumType(dbType: string): ControlTypes {
		const adjType = dbType.toLowerCase();
		if (adjType.includes("char") || adjType.includes("text")) {
			return ControlTypes.Text;
		}
		else if (adjType === "uniqueidentifier") {
			return ControlTypes.Guid;
		}
		else if (adjType.includes("date")) {
			return ControlTypes.DateTime;
		}
		else {
			return ControlTypes.Numeric;
		}
	}
}
