import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "activeInactive",
    standalone: false
})
export class ActiveInactivePipe implements PipeTransform {
	transform(value: any, ...args: any[]): any {
		const isYes = value === true;
		return isYes ? "Active" : "Inactive";
	}
}
