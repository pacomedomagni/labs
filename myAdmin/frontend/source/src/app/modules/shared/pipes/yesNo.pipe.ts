import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "yesNo",
    standalone: false
})
export class YesNoPipe implements PipeTransform {
	transform(value: any, ...args: any[]): any {
		if (value != null && typeof value === "string") {
			return value.toLowerCase().startsWith("y") ? "Yes" : "No";
		}
		else if (value != null && typeof value === "boolean") {
			return value ? "Yes" : "No";
		}
		return value;
	}
}
