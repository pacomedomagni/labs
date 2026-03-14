import {
	Pipe,
	PipeTransform
} from "@angular/core";

@Pipe({
    name: "kmToMiles",
    standalone: false
})
export class KmToMilesPipe implements PipeTransform {

	transform(value: number, ...args: any[]): string {
		return `${(value * 0.62137119).toFixed(2)}`;
	}
}

