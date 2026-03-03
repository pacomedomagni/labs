import { Pipe, PipeTransform } from "@angular/core";
import { Duration } from "moment";

@Pipe({
    name: "duration",
    standalone: false
})
export class DurationPipe implements PipeTransform {

	transform(value: Duration, ...args: any[]): string {
		return `${value.hours}:${value.minutes}:${value.seconds}`;
	}
}

