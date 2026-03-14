import { Pipe, PipeTransform } from "@angular/core";

/*
 Applies Null Coalescing to the value
 (Provides typescripts ?? operator like functionality in templates since Angular (v10) does not yet support this as of 11/25/2020)

 Takes an fallback value argument.
 Usage:
	 value | nullishCoalesce:fallbackValue
 Example:
	 {{ null | nullishCoalesce:'some fallback value' }}
	 formats to: 'some fallback value'
*/

@Pipe({
    name: "nullCoalesce",
    standalone: false
})
export class NullCoalescePipe implements PipeTransform {
	transform<T, K>(value: T, fallbackValue: K): NonNullable<T> | K {
		return value != null ? value as NonNullable<T> : fallbackValue;
	}
}
