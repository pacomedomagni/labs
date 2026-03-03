import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "phoneNumber",
    standalone: false
})
export class PhoneNumberPipe implements PipeTransform {
	transform(value: string, args?: any): any {
		if (value === undefined || value === null || value === "") {
			return null;
		}

		const areaCode = value.slice(0, 3);
		const exchangeCode = value.slice(3, 6);
		const lineNumber = value.slice(6);

		return `(${areaCode}) ${exchangeCode}-${lineNumber}`;
	}
}
