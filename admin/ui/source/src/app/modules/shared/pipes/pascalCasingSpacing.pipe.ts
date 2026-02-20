import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "pascalCasingSpacing",
    standalone: false
})
export class PascalCasingSpacingPipe implements PipeTransform {
	transform(value: string): string {
        // regex for finding uppercase letters.
        // uses look-ahead to check if next letter is uppercase without including it in the match,
        // therefore keeping it in each split
		let splitWords = value.split(/(?=[A-Z][a-z])/);
        return splitWords.join(" ").trim();
	}
}