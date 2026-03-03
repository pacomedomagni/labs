import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "enumTranslate",
    standalone: false
})
export class EnumTranslationPipe implements PipeTransform {
	transform(value: any, enums: Map<any, string>): any {
		if (typeof value === "string") {
			value = parseInt(value);
		}
		return !!value ? `${enums.get(value)} (${value})` : null;
	}
}
