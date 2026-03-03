import {
	Injector,
	Pipe,
	PipeTransform
} from "@angular/core";

@Pipe({
    name: "dynamicPipe",
    standalone: false
})
export class DynamicPipe implements PipeTransform {

	public constructor(private injector: Injector) { }

	transform(value: any, pipeToken: any, pipeArgs: any[]): any {
		if (!pipeToken) {
			return value;
		}
		else {
			const pipe = this.injector.get<PipeTransform>(pipeToken);
			if (Array.isArray(pipeArgs)) {
				return pipe.transform(value, ...pipeArgs);
			}
			else {
				return pipe.transform(value, pipeArgs);
			}
		}
	}
}
