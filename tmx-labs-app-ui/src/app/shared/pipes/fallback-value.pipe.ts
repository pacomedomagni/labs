import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tmxFallbackValue',
  standalone: true,
})
export class FallbackValuePipe implements PipeTransform {
  transform(value: unknown, fallback = '--'): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    const stringValue = String(value).trim();
    return stringValue.length > 0 ? stringValue : fallback;
  }
}
