import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tmxDisplayDate',
  standalone: true,
})
export class DisplayDatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    locale?: string,
    options?: Intl.DateTimeFormatOptions,
  ): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    if (locale || options) {
      return date.toLocaleString(locale, options);
    }

    return date.toLocaleString();
  }
}
